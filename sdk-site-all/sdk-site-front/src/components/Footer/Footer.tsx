import { useState, useEffect } from 'react';
import styles from './Footer.module.css';
import logo from '@assets/logoLight.png';

const Footer = () => {
    const [settings, setSettings] = useState({
        phone: '+7 (888) 888-88-88',
        email: 'adress_email.ru',
        address: 'г. Томск, ул. Кузовлевский тракт, 2Б ст31',
        work_hours: 'Пн-Пт: 9:00-18:00',
        footer_text: '© 2026 ООО «СДК». Все права защищены.',
        _updated: Date.now()
    });

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/settings/')
            .then(res => res.json())
            .then(data => {
                const settingsData = data.results?.[0] || data;
                if (settingsData) {
                    setSettings({
                        phone: settingsData.phone || settings.phone,
                        email: settingsData.email || settings.email,
                        address: settingsData.address || settings.address,
                        work_hours: settingsData.work_hours || settings.work_hours,
                        footer_text: settingsData.footer_text || settings.footer_text,
                        _updated: Date.now()
                    });
                }
            })
            .catch(err => console.error('Ошибка загрузки настроек:', err));
    }, []);

    return (
        <footer key={settings._updated} className={styles.footer}>
            <div className={styles.footerMain}>
                <div className={styles.footerSection}>
                    <div className={styles.logoSection}>
                        <img src={logo} alt="Логотип компании" className={styles.footerLogo} />
                        <h4>Надёжный поставщик пиломатериалов по всей России.</h4>
                        <p className={styles.companyDescription}>
                            Мы предлагаем древесину только высокого качества: от доски и шпона до фанеры и щепы.
                            Работаем с 2005 года — знаем всё о дереве и честной цене.
                        </p>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h3 className={styles.sectionTitle}>Навигация</h3>
                    <nav className={styles.footerNav}>
                        <a href="/" className={styles.footerLink}>Главная</a>
                        <a href="/catalog" className={styles.footerLink}>Каталог</a>
                        <a href="/documents" className={styles.footerLink}>Документация</a>
                    </nav>
                </div>

                <div className={styles.footerSection}>
                    <h3 className={styles.sectionTitle}>Контакты</h3>
                    <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Адрес:</span>
                            <span className={styles.contactText}>{settings.address}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Телефон:</span>
                            <span className={styles.contactText}>{settings.phone}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Email:</span>
                            <span className={styles.contactText}>{settings.email}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactLabel}>Режим работы:</span>
                            <span className={styles.contactText}>{settings.work_hours}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <div className={styles.copyright}>{settings.footer_text}</div>
            </div>
        </footer>
    );
};

export default Footer;