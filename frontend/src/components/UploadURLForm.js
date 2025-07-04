import React, { useState } from 'react';

function UploadURLForm() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await fetch('https://upload-source-qdrant-281983614239.asia-northeast1.run.app/upload_url/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({url}),
            });

            console.log(response);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data.status == 200 ? 'URLアップロード成功' : 'URLアップロードに失敗しました');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

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
