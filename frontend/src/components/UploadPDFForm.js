import React, { useState } from 'react';

function UploadPDFForm() {
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
            setError('PDFファイルを選択してください');
            setIsLoading(false);
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('http://localhost:8002/upload_pdf/', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResult(data.isUploaded ? 'PDFアップロード成功' : 'PDFアップロード失敗');
        } catch (e) {
            setError('アップロードに失敗しました: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '2em 0' }}>
            <h2>PDFアップロード</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button type="submit" disabled={isLoading} style={{ marginLeft: '1em' }}>
                    {isLoading ? '送信中...' : 'アップロード'}
                </button>
            </form>
            {result && <p style={{ color: 'green' }}>{result}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default UploadPDFForm;
