import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import styles from './AdminSettings.module.css';

const AdminSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        phone: '',
        email: '',
        address: '',
        work_hours: '',
        footer_text: '',
        contact_text: ''
    });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!token) return;
        apiService.getSettings()
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            await apiService.updateSettings(settings);
            setSaved(true);
            setTimeout(() => {
                window.location.reload(); // Перезагружаем страницу после сохранения
            }, 500);
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения');
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Настройки сайта</h1>
                <p className={styles.description}>
                    Здесь можно изменить контактные данные и текст, которые отображаются на всех страницах.
                </p>
            </div>

            {saved && <div className={styles.success}>✅ Настройки сохранены! Страница обновится...</div>}

            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Телефон</label>
                    <input type="text" name="phone" value={settings.phone} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" name="email" value={settings.email} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Адрес</label>
                    <input type="text" name="address" value={settings.address} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Режим работы</label>
                    <input type="text" name="work_hours" value={settings.work_hours} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Текст в футере (копирайт)</label>
                    <input type="text" name="footer_text" value={settings.footer_text} onChange={handleChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>Текст в блоке "Нужна консультация?"</label>
                    <textarea name="contact_text" value={settings.contact_text} onChange={handleChange} rows={3} />
                </div>

                <button onClick={handleSave} className={styles.saveBtn}>
                    Сохранить настройки
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;