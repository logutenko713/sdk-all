import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import styles from './Header.module.css';
import logo from '@assets/logo.png';
import shopIcon from '@assets/icons/shopIcon.png';
import ShopingCart from '@components/ShopingCart';
import { useCart } from '@contexts/CartContext';
import { apiService } from '@services/api';

const Header: React.FC = () => {
    const {
        state,
        openCart,
        closeCart,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems
    } = useCart();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [settings, setSettings] = useState({
        address: 'Кузовлевский тракт, 2Б ст31',
        email: 'adress_email.ru',
        phone: '+7 (888) 888 88-88'
    });

    // Загружаем настройки сайта (только для данных, не трогаем вёрстку)
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/settings/')
            .then(res => res.json())
            .then(data => {
                const settingsData = data.results?.[0] || data;
                if (settingsData) {
                    setSettings({
                        address: settingsData.address || settings.address,
                        email: settingsData.email || settings.email,
                        phone: settingsData.phone || settings.phone
                    });
                }
            })
            .catch(err => console.error('Ошибка загрузки настроек:', err));
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleCheckout = async () => {
        if (!state.items.length) return;

        try {
            await apiService.createOrder({
                client_name: 'Клиент',
                client_surname: 'Без данных',
                client_patronymic: '',
                phone: '+70000000000',
                email: '',
                comment: 'Заказ без персональных данных'
            });
            clearCart();
            closeCart();
        } catch (err) {
            console.error('Ошибка оформления заказа:', err);
        }
    };

    return (
        <>
            <div className={styles.topRow}>
                <div className={styles.contactsHeader}>
                    <span className={styles.topItems}>{settings.address}</span>
                    <span className={styles.topItems}>{settings.email}</span>
                    <span className={styles.topItems}>{settings.phone}</span>
                </div>
            </div>
            <div className={styles.stickyBottom}>
                <div className={styles.bottomRow}>
                    <a href="/" className={styles.logoLink}>
                        <img src={logo} alt="Логотип компании" className={styles.logo} />
                    </a>

                    <nav className={styles.headerNav}>
                        <Link to="/" className={styles.navLink}>Главная</Link>
                        <a href="/catalog" className={styles.navLink}>Каталог</a>
                        <Link to="/documents" className={styles.navLink}>Документация</Link>
                    </nav>

                    <button
                        onClick={openCart}
                        className={styles.buyButton}
                    >
                        <img src={shopIcon} alt="Иконка корзины" className={styles.shopIcon} />
                        Корзина
                        {getTotalItems() > 0 && (
                            <span className={styles.cartBadge}>
                                {getTotalItems()}
                            </span>
                        )}
                    </button>

                    <div className={styles.mobileMenu}>
                        <button
                            onClick={openCart}
                            className={styles.mobileCartButton}
                        >
                            <img src={shopIcon} alt="Иконка корзины" className={styles.mobileCartIcon} />
                            {getTotalItems() > 0 && (
                                <span className={styles.mobileCartBadge}>
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>

                        <div className={styles.menuContainer}>
                            <button
                                className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                                onClick={toggleMenu}
                                aria-label="Меню"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>

                            <nav className={`${styles.dropdownMenu} ${isMenuOpen ? styles.dropdownMenuActive : ''}`}>
                                <Link to="/" className={styles.dropdownLink} onClick={closeMenu}>
                                    Главная
                                </Link>
                                <a href="/catalog" className={styles.dropdownLink} onClick={closeMenu}>
                                    Каталог
                                </a>
                                <Link to="/documents" className={styles.dropdownLink} onClick={closeMenu}>
                                    Документация
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <ShopingCart
                        isOpen={state.isOpen}
                        onClose={closeCart}
                        items={state.items}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>
        </>
    );
};

export default Header;