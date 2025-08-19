import React, { useEffect, useState } from "react";

function LearningIndex() {
    const [collectionName, setCollectionName] = useState('yamaha_collection_1')
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleSelectValChange = (value) => {
        const intValue = parseInt(value, 10);
        setCollectionName(`yamaha_collection_${intValue}`);
        console.log('Selected collection name:', `yamaha_collection_${intValue}`, typeof intValue);
        setIsLoading(true);
        fetchData(`yamaha_collection_${intValue}`);
    }

    const fetchData = async (collectionName) => {
        try {
            setIsLoading(true);
            const response = await fetch('https://jetb-agent-server-281983614239.asia-northeast1.run.app/get_learning_data/', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ collection_name: collectionName })
            });

            const finalResponse = await response.json();
            const dataArr = finalResponse.points.map(point => {
                const meta = point?.payload?.metadata || {};
                const item = {
                    sourceTitle: meta.title ? meta.title : meta.source,
                    sourceType: meta.type
                };
                if (meta.type === 'url') {
                    item.sourceUrl = meta.source;
                }
                return item;
            });

            console.log(dataArr);
            setData(dataArr);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData(collectionName);
    }, [collectionName]);

    return (
        <div className="learning-index-container">
            <h2>学習データ一覧</h2>
            <div className="select-container">
                <label htmlFor="collection-select">参照データベースを選択:</label>
                <select id="collection-select" onChange={(e) => handleSelectValChange(e.target.value)}>
                    <option value="1">データベース1</option>
                    <option value="2">データベース2</option>
                    <option value="3">データベース3</option>
                    <option value="4">データベース4</option>
                    <option value="5">データベース5</option>
                </select>
            </div>
            <div className="data-container">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>データを読み込み中...</p>
                    </div>
                ) : (
                    data && data.map((item, index) => (
                        <div key={index} className="data-item">
                            <div className="data-item-title">{item.sourceTitle}</div>
                            {item.sourceType && <div className="data-item-type">データ形式:{item.sourceType}</div>}
                            {item.sourceUrl && (
                                <div className="data-item-url">
                                    <a href={item.sourceUrl} target="_blank" rel="noreferrer nofollow" style={{ color: '#fff', cursor: 'pointer' }}>{item.sourceUrl}</a>
                                </div>
                            )}
                        </div>
                    ))
                )} 
            </div>
        </div>
    )
}

export default LearningIndex;