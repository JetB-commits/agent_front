import React, { useState } from 'react';

function UploadSitemapForm() {
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
            const response = await fetch('http://localhost:8002/upload_sitemap/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data.message ? data.message : 'サイトマップアップロード成功');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '2em 0' }}>
            <h2>サイトマップURLアップロード</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>サイトマップURL：</label>
                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                        style={{ width: '60%' }}
                        placeholder="https://example.com/sitemap.xml"
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

export default UploadSitemapForm;
