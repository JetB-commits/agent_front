import React, { useState, useEffect } from 'react';

function UploadPDFForm() {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedNum, setSelectedNum] = useState(1);

    useEffect(() => {
        setSelectedNum(1);
    }, []);

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
            formData.append('selected_number', parseInt(selectedNum, 10));
            const response = await fetch('https://upload-source-qdrant-281983614239.asia-northeast1.run.app/upload_pdf_yamaha/', {
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

    const handleSelectValChange = (value) => {
        const intValue = parseInt(value, 10);
        setSelectedNum(intValue);
        console.log('Selected number (as integer):', intValue, typeof intValue);
    }

    return (
        <div className="upload-form-container">
            <h2>PDFアップロード</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="pdf-file">PDFファイルを選択:</label>
                    <input type="file" id="pdf-file" accept="application/pdf" onChange={handleFileChange} />
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

export default UploadPDFForm;
