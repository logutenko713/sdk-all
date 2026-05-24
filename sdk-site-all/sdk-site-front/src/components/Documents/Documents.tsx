import { useEffect, useState } from 'react';
import styles from './Documents.module.css';

const Documents = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/documentation/')
            .then(res => res.json())
            .then(data => {
                console.log('Ответ API:', data);  // ← для отладки
                setDocs(data.results || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Загрузка документов...</div>;

    return (
        <div className={styles.container}>
            <h1>Документация</h1>
            <div className={styles.docsList}>
                {docs.map(doc => (
                    <div key={doc.id} className={styles.docCard}>
                        {doc.image_url && (
                            <img src={doc.image_url} alt={doc.name} className={styles.docImage} />
                        )}
                        <h3>{doc.name}</h3>
                        {doc.pdf_url && (
                            <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                                Скачать PDF
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Documents;