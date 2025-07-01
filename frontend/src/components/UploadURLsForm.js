import React, { useState } from 'react';

function UploadURLsForm() {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);
        if (!file) {
            setError('ファイルを選択してください');
            setIsLoading(false);
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('http://localhost:8002/upload_urls/', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data.results ? data.results : 'アップロード成功');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '2em 0' }}>
            <h2>複数URLデータアップロード</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".txt,.csv" onChange={handleFileChange} />
                <button type="submit" disabled={isLoading} style={{ marginLeft: '1em' }}>
                    {isLoading ? '送信中...' : 'アップロード'}
                </button>
            </form>
            {result && Array.isArray(result) ? (
                <div style={{ marginTop: '1em' }}>
                    <h4>結果:</h4>
                    <ul>
                        {result.map((r, i) => (
                            <li key={i}>
                                {r.url ? `${r.url}: ` : ''}
                                {r.error ? <span style={{ color: 'red' }}>{r.error}</span> : '成功'}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : result && typeof result === 'string' ? (
                <p style={{ color: 'green' }}>{result}</p>
            ) : null}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default UploadURLsForm;
