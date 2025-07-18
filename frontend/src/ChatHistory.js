import React, { useState, useEffect } from 'react';

function ChatHistory() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:8001/chat_history/');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Chat history fetched:", data);
                setHistory(data);
                console.log(history);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch chat history:", e);
            } finally {
                setIsLoading(false);
            }
        };        fetchHistory();
    }, [history]);

    console.log("Chat history state:", history);

    if (isLoading) {
        return <p>Loading chat history...</p>;
    }

    if (error) {
        return <p>Error loading chat history: {error}</p>;
    }

    return (
        <div>
            <h2>Chat History</h2>

            <ul>
                <li>
                    <p>質問：{ history.user_question}</p>
                    <p>回答：{history.chat_history}</p>
                </li>
            </ul>

        </div>
    );
}

export default ChatHistory;
