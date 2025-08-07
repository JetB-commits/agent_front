import React, { useState, useEffect } from 'react';

function UploadURLForm() {
    const [url, setUrl] = useState('');
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
            const response = await fetch('https://upload-source-qdrant-281983614239.asia-northeast1.run.app/upload_url_yamaha/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    selected_number: parseInt(selectedNum, 10)  
                }),
            });

            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }
            
            setResult(data.isUploaded === true ? 'URLアップロード成功' : 'URLアップロードに失敗しました');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectValChange = (value) => {
        console.log('Received value:', value, typeof value);
        const intValue = parseInt(value, 10);
        console.log('Parsed value:', intValue, typeof intValue);
        setSelectedNum(intValue);
        console.log('Selected number (as integer):', intValue, typeof intValue);
    }

    return (
        <div className="upload-form-container">
            <h2>URLデータアップロード</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="url-input">URL：</label>
                    <input
                        type="url"
                        id="url-input"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                        placeholder="https://example.com"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="uploadDestination">アップロード先指定：</label>
                    <select value={selectedNum} onChange={e => handleSelectValChange(e.target.value)} id="selected_number">
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

export default UploadURLForm;
