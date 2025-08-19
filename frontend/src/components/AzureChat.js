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
      const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/azure_agent_reset/', {
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

    console.log('=== Azure Chat Submit Started ===');
    const currentInput = input; // 入力値を保存
    console.log('User input:', currentInput);
    
    const userMessage = { sender: 'user', text: currentInput, id: `user-${Date.now()}` };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const botMessageId = `bot-${Date.now()}`;
    console.log('Bot message ID:', botMessageId);
    
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
          user_id: 7
        }),
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Response error body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('Starting to read streaming response...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Streaming completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        console.log('Buffer updated:', buffer);

        // 改行で分割してJSONを処理
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const rawLine = buffer.slice(0, idx).trimEnd();
          buffer = buffer.slice(idx + 1);
          
          console.log('Processing line:', rawLine);
          
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
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = `❌ 接続エラーが発生しました: ${error.message}`;
      
      // より具体的なエラーメッセージを提供
      if (error.message.includes('500')) {
        errorMessage = `❌ サーバーエラー（500）: AZURE_OPENAI_MODELの設定を確認してください`;
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = `❌ ネットワークエラー: サーバーに接続できません`;
      }
      
      setMessages((prevMessages) =>
        prevMessages.map(msg =>
          msg.id === botMessageId 
            ? { 
                ...msg, 
                isLoading: false, 
                text: errorMessage,
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

