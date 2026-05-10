import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ShopingCart.module.css';
import type { ShopingCartProps } from '@types';

const ShopingCart: React.FC<ShopingCartProps> = ({
    isOpen = false,
    onClose,
    items = [],
    onUpdateQuantity,
    onRemoveItem,
    onCheckout
}) => {
    const navigate = useNavigate();

    const handleIncreaseQuantity = (id: string) => {
        const item = items.find(item => item.id === id);
        if (item && onUpdateQuantity) {
            onUpdateQuantity(id, item.quantity + 1);
        }
    };

    const handleDecreaseQuantity = (id: string) => {
        const item = items.find(item => item.id === id);
        if (item && onUpdateQuantity) {
            if (item.quantity > 1) {
                onUpdateQuantity(id, item.quantity - 1);
            } else {
                if (onRemoveItem) onRemoveItem(id);
            }
        }
    };

    const handleRemoveItem = (id: string) => {
        if (onRemoveItem) onRemoveItem(id);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={onClose}
            />

            <div className={`${styles.cart} ${isOpen ? styles.cartOpen : ''}`}>
                <div className={styles.cartHeader}>
                    <h2 className={styles.cartTitle}>Корзина пиломатериалов</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрыть корзину"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.cartContent}>
                    {items.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyCartIcon}>🪵</div>
                            <p>Корзина пуста</p>
                            <span>Добавьте пиломатериалы для расчета</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.cartItems}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemInfo}>
                                            <h4 className={styles.itemName}>{item.name}</h4>
                                            <div className={styles.itemDetails}>
                                                <span className={styles.dimensions}>{item.dimensions}</span>
                                                <span className={styles.woodType}>{item.woodType}</span>
                                                <span className={styles.grade}>Сорт: {item.grade}</span>
                                            </div>
                                            <div className={styles.itemPrice}>
                                                {formatPrice(item.price)} / шт
                                            </div>
                                        </div>

                                        <div className={styles.itemControls}>
                                            <div className={styles.quantityControls}>
                                                <button
                                                    className={styles.quantityButton}
                                                    onClick={() => handleDecreaseQuantity(item.id)}
                                                    aria-label="Уменьшить количество"
                                                >
                                                    -
                                                </button>
                                                <span className={styles.quantity}>{item.quantity}</span>
                                                <button
                                                    className={styles.quantityButton}
                                                    onClick={() => handleIncreaseQuantity(item.id)}
                                                    aria-label="Увеличить количество"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className={styles.itemTotal}>
                                                {formatPrice(item.price * item.quantity)}
                                            </div>

                                            <button
                                                className={styles.removeButton}
                                                onClick={() => handleRemoveItem(item.id)}
                                                aria-label="Удалить товар"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.cartFooter}>
                                <div className={styles.totalSection}>
                                    <div className={styles.totalLine}>
                                        <span>Итого:</span>
                                        <span className={styles.totalPrice}>{formatPrice(calculateTotal())}</span>
                                    </div>
                                    <div className={styles.totalItems}>
                                        {items.reduce((sum, item) => sum + item.quantity, 0)} ед. пиломатериалов
                                    </div>
                                </div>

                                <button
                                    className={styles.checkoutButton}
                                    onClick={() => navigate('/checkout')}
                                >
                                    Оформить заказ
                                </button>

                                <div className={styles.cartNote}>
                                    📞 Бесплатная консультация по подбору пиломатериалов
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ShopingCart;