import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminCallbacks.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/callbacks/';

const AdminCallbacks = () => {
    const { token } = useAuth();
    const [callbacks, setCallbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, {
            headers: { 'Authorization': `Token ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setCallbacks(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    const markProcessed = async (id: number) => {
        await fetch(`${API_URL}${id}/mark_processed/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` }
        });
        setCallbacks(callbacks.map(c => 
            c.id === id ? { ...c, is_processed: true } : c
        ));
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Заявки на обратный звонок</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Телефон</th>
                        <th>Дата</th>
                        <th>Обработана</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {callbacks.map(c => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.phone}</td>
                            <td>{new Date(c.created_at).toLocaleString()}</td>
                            <td>{c.is_processed ? '✅' : '❌'}</td>
                            <td>
                                {!c.is_processed && (
                                    <button onClick={() => markProcessed(c.id)}>
                                        Отметить обработанной
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCallbacks;