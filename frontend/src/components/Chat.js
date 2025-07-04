import React, { useState, useRef, useEffect } from 'react';

// スタイルはCSSファイルに記述することを推奨しますが、ここに含めます
const styles = `
.App {
  font-family: sans-serif;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f4f9;
}

.chat-window {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
  text-align: left;
  line-height: 1.5;
}

.message.user {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.message.bot {
  background-color: #e9e9eb;
  color: #333;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-form {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  // セッション管理のためのstate
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
      setMessages([]); // メッセージをクリア
      setLastResponseId(null); // セッションIDもクリア
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
    
    // ボットのメッセージをプレースホルダーとして追加
    const botMessageId = `bot-${Date.now()}`;
    const placeholderMessage = { id: botMessageId, sender: 'bot', text: '', isLoading: true };
    setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

    setInput('');
    setIsLoading(true);

    try {
      // ストリーミングエンドポイントを呼び出す
      const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/rag_mcp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 会話履歴を考慮するために previous_response_id を送信
        body: JSON.stringify({ 
          question: input,
          previous_response_id: lastResponseId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ReadableStreamを使ってレスポンスを処理
      const reader = response.body.getReader(); 
      console.log(reader);
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // ストリームが終了したらループを抜ける

        // 受け取ったデータを文字列にデコードし、バッファに追加
        buffer += decoder.decode(value, { stream: true });
        
        // バッファを改行で分割し、完全なJSONオブジェクトを処理
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 最後の行は不完全な可能性があるためバッファに残す

        for (const line of lines) {
            if (line.trim() === '') continue;
            const parsed = JSON.parse(line);
            
            if (parsed.type === 'chunk') {
                // 'chunk'タイプの場合、テキストを追記してUIを更新
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { ...msg, text: msg.text + parsed.content }
                        : msg
                ));
            } else if (parsed.type === 'metadata') {
                // 'metadata'タイプの場合、ローディングを解除し、次のリクエストのためにIDを保存
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, isLoading: false } : msg
                ));
                // 次の質問で会話履歴を継続するためにレスポンスIDを保存
                setLastResponseId(parsed.response_id); 
                console.log("Source:", parsed.source);
            } else if (parsed.type === 'error') {
                throw new Error(parsed.content);
            }
        }
      }

    } catch (error) {
      console.error("Fetch error:", error);
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
      <style>{styles}</style>
      <div className="App">
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
        <button onClick={handleResetSession} disabled={isLoading}>会話履歴をリセット</button>
      </div>
    </>
  );
}

export default Chat;
