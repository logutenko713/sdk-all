import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.css';

const CheckoutPage: React.FC = () => {
    const { state, clearCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        phone: '',
        email: '',
        comment: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const orderData = {
            client_name: formData.name,
            client_surname: formData.surname,
            client_patronymic: formData.patronymic,
            phone: formData.phone,
            email: formData.email,
            comment: formData.comment,
        };

        const sessionKey = localStorage.getItem('session_key');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Key': sessionKey || '',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                clearCart();
                navigate('/');
                alert('Заказ успешно оформлен!');
            } else {
                const error = await response.json();
                console.error('Ошибка:', error);
                alert('Ошибка при оформлении заказа');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Не удалось соединиться с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Оформление заказа</h1>
            <div className={styles.content}>
                <div className={styles.formSection}>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Имя *" value={formData.name} onChange={handleChange} required />
                        <input type="text" name="surname" placeholder="Фамилия *" value={formData.surname} onChange={handleChange} required />
                        <input type="text" name="patronymic" placeholder="Отчество" value={formData.patronymic} onChange={handleChange} />
                        <input type="tel" name="phone" placeholder="Телефон *" value={formData.phone} onChange={handleChange} required />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                        <textarea name="comment" placeholder="Комментарий" value={formData.comment} onChange={handleChange} rows={3} />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Отправка...' : 'Отправить заказ'}
                        </button>
                    </form>
                </div>
                <div className={styles.cartSection}>
                    <h2>Ваш заказ</h2>
                    {state.items.length === 0 ? <p>Корзина пуста</p> : (
                        <>
                            {state.items.map(item => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div><strong>{item.name}</strong></div>
                                    <div>{item.dimensions} | {item.woodType} | Сорт: {item.grade}</div>
                                    <div>{item.price} ₽ × {item.quantity} = {item.price * item.quantity} ₽</div>
                                </div>
                            ))}
                            <div className={styles.total}>Итого: {totalPrice} ₽</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;