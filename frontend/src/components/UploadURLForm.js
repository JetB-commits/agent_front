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
            const response = await fetch('http://localhost:8002/upload_url/', {
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
            setResult(data.isUploaded == true ? data.isUploaded : 'URLアップロード成功');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '2em 0' }}>
            <h2>URLデータアップロード</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>URL：</label>
                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                        style={{ width: '60%' }}
                        placeholder="https://example.com"
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

export default UploadURLForm;
