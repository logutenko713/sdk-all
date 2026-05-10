import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminOrders.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/orders/';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, {
            headers: { 'Authorization': `Token ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setOrders(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    const updateStatus = async (id: number, statusId: number) => {
        await fetch(`${API_URL}${id}/update_status/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ status_id: statusId })
        });
        // Обновляем список
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.results || []);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Управление заказами</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Номер заказа</th>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.order_number}</td>
                            <td>{order.client_surname} {order.client_name}</td>
                            <td>{order.phone}</td>
                            <td>{order.total_price} ₽</td>
                            <td>{order.status?.name || '—'}</td>
                            <td>
                                <select
                                    onChange={(e) => updateStatus(order.id, parseInt(e.target.value))}
                                    defaultValue={order.status?.id}
                                >
                                    <option value="1">Новый</option>
                                    <option value="2">В обработке</option>
                                    <option value="3">Доставлен</option>
                                    <option value="4">Отменён</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;