import React, { useState } from 'react';

function UploadQAForm() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await fetch('http://localhost:8002/upload_qa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question, answer }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data.isUploaded ? 'アップロード成功' : 'アップロード失敗');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '2em 0' }}>
            <h2>一問一答アップロード</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>質問：</label>
                    <input
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        required
                        style={{ width: '60%' }}
                    />
                </div>
                <div style={{ marginTop: '1em' }}>
                    <label>回答：</label>
                    <input
                        type="text"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        required
                        style={{ width: '60%' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ marginTop: '1em' }}>
                    {isLoading ? '送信中...' : 'アップロード'}
                </button>
            </form>
            {result && <p style={{ color: 'green' }}>{result}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default UploadQAForm;
