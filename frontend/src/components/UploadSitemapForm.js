import React, { useState, useEffect } from 'react';

function UploadSitemapForm() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedNum, setSelectedNum] = useState(1);

    useEffect(() => {
        setSelectedNum(1);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await fetch('https://upload-source-qdrant-281983614239.asia-northeast1.run.app/upload_sitemap_yamaha/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url, 
                    selected_number: parseInt(selectedNum, 10) 
                }),
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

    const handleSelectValChange = (value) => {
        const intValue = parseInt(value, 10);
        setSelectedNum(intValue);
        console.log('Selected number (as integer):', intValue, typeof intValue);
    }

    return (
        <div className="upload-form-container">
            <h2>サイトマップURLアップロード</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="sitemap-url">サイトマップURL：</label>
                    <input
                        type="url"
                        id="sitemap-url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                        placeholder="https://example.com/sitemap.xml"
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

export default UploadSitemapForm;
