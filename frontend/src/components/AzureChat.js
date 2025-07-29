import React, { useState, useRef, useEffect } from 'react';

function AzureChat() {
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

    const currentInput = input; // 入力値を保存
    const userMessage = { sender: 'user', text: currentInput, id: `user-${Date.now()}` };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const botMessageId = `bot-${Date.now()}`;
    const placeholderMessage = { 
      id: botMessageId, 
      sender: 'bot', 
      text: '', 
      isLoading: true,
      source: null,
      source_id: null 
    };
    setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/azure_agent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentInput,
          previous_response_id: lastResponseId
        }),
      });

      console.log(response)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 改行で分割してJSONを処理
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const rawLine = buffer.slice(0, idx).trimEnd();
          buffer = buffer.slice(idx + 1);
          
          if (!rawLine) continue; // 空行スキップ

          // SSE形式の場合は 'data:' プレフィックスを除去
          const line = rawLine.startsWith('data:') ? rawLine.slice(5).trimStart() : rawLine;
          
          if (!line) continue; // 空のデータ行スキップ

          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (err) {
            console.error('JSON parse error:', err, 'Line:', line);
            continue; // パースエラーは無視して続行
          }

          console.log('Received message:', parsed);

          switch (parsed.type) {
            case 'chunk':
              // Azure OpenAI からのストリーミングチャンクを処理
              if (parsed.content) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botMessageId
                      ? { ...msg, text: msg.text + parsed.content }
                      : msg
                  )
                );
              }
              break;

            case 'metadata':
              // Azure OpenAI からのメタデータを処理
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId 
                    ? { 
                        ...msg, 
                        isLoading: false,
                        source: parsed.source || 'Azure OpenAI',
                        source_id: parsed.source_id || 'azure_openai'
                      } 
                    : msg
                )
              );
              
              // response_id が存在する場合は保存
              if (parsed.response_id) {
                setLastResponseId(parsed.response_id);
              }
              break;

            case 'error':
              // エラーメッセージを表示
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId
                    ? { 
                        ...msg, 
                        isLoading: false, 
                        text: `⚠️ エラー: ${parsed.content}`,
                        source: 'Error',
                        source_id: 'error'
                      }
                    : msg
                )
              );
              console.error('Server error:', parsed.content);
              break;

            default:
              console.warn('Unknown message type:', parsed.type, parsed);
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prevMessages) =>
        prevMessages.map(msg =>
          msg.id === botMessageId 
            ? { 
                ...msg, 
                isLoading: false, 
                text: `❌ 接続エラーが発生しました: ${error.message}`,
                source: 'Error',
                source_id: 'connection_error'
              } 
            : msg
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
            <div className="message-content">
              {msg.text}
              {msg.isLoading && <div className="loader"></div>}
            </div>
            {msg.source && msg.sender === 'bot' && (
              <div className="message-source">
                <small>Source: {msg.source} ({msg.source_id})</small>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Azure OpenAIに質問を入力..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '送信中...' : '送信'}
        </button>
      </form>
      <div className="chat-controls">
        <button 
          onClick={handleResetSession} 
          disabled={isLoading} 
          className="reset-button"
        >
          {isLoading ? 'リセット中...' : '会話履歴をリセット'}
        </button>
        {lastResponseId && (
          <small className="response-id">
            Last Response ID: {lastResponseId}
          </small>
        )}
      </div>
    </>
  );
}

export default AzureChat;

