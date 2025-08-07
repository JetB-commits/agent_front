import React, { useState } from 'react';

function UploadQAForm() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedNum, setSelectedNum] = useState(1); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await fetch('https://upload-source-qdrant-281983614239.asia-northeast1.run.app/upload_qa_yamaha/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    question, 
                    answer, 
                    selected_number: parseInt(selectedNum, 10) 
                }),
            });

            console.log(response);
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


    const handleSelectValChange = (value) => {
        const intValue = parseInt(value, 10);
        setSelectedNum(intValue);
        console.log('Selected number (as integer):', intValue, typeof intValue);
    }

    return (
        <div className="upload-form-container">
            <h2>一問一答アップロード</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="question">質問：</label>
                    <input
                        type="text"
                        id="question"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="answer">回答：</label>
                    <input
                        type="text"
                        id="answer"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="uploadDestination">アップロード先指定：</label>
                    <select value={selectedNum} onChange={e => handleSelectValChange(e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '送信中...' : 'アップロード'}
                </button>
            </form>
            {result && <p className="success">{result}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default UploadQAForm;
