import React, { useState, useRef, useEffect } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponseId, setLastResponseId] = useState(null);

  const handleResetSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/reset_session/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setMessages([]);
      setLastResponseId(null);
      alert('セッションがリセットされました。');
    } catch (error) {
      console.error("Reset session error:", error);
      alert('セッションのリセットに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input, id: `user-${Date.now()}` };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const botMessageId = `bot-${Date.now()}`;
    const placeholderMessage = { id: botMessageId, sender: 'bot', text: '', isLoading: true };
    setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/rag_mcp_azure/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          previous_response_id: lastResponseId
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 改行は \n または \r\n のどちらも想定
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const rawLine = buffer.slice(0, idx).trimEnd(); // \r も除外
          buffer = buffer.slice(idx + 1);                 // 次ループに残す
          if (!rawLine) continue;                         // 空行はスキップ

          // SSE 形式なら先頭の 'data:' を外す
          const line = rawLine.startsWith('data:') ? rawLine.slice(5).trimStart()
            : rawLine;

          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (err) {
            console.error('JSON parse error:', err, line);
            // パース失敗行は無視して続行
            continue;
          }

          switch (parsed.type) {
            case 'chunk':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, text: msg.text + parsed.content }
                    : msg
                )
              );
              break;

            case 'metadata':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId ? { ...msg, isLoading: false } : msg
                )
              );
              setLastResponseId(parsed.response_id);
              break;

            case 'error':
              // 例外を投げず UI に表示して続行
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, isLoading: false, text: '⚠ ' + parsed.content }
                    : msg
                )
              );
              break;

            default:
              console.warn('Unknown message type:', parsed);
          }
        }
      }
    } catch (error) {
      console.log("Fetch error:", error);
      const errorMessage = { sender: 'bot', text: 'エラーが発生しました。', isLoading: false };
      setMessages((prevMessages) =>
        prevMessages.map(msg =>
          msg.id === botMessageId ? { ...errorMessage, id: Date.now() } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}
            {msg.isLoading && <div className="loader"></div>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>送信</button>
      </form>
      <button onClick={handleResetSession} disabled={isLoading} className="reset-button">会話履歴をリセット</button>
    </>
  );
}

export default Chat;

