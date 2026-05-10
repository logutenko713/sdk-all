import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminSettings.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/settings/';

const AdminSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        phone: '',
        email: '',
        address: '',
        work_hours: '',
        footer_text: ''
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, {
            headers: { 'Authorization': `Token ${token}` }
        })
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(console.error);
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = async () => {
        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(settings)
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.container}>
            <h1>Настройки сайта</h1>
            {saved && <div className={styles.success}>✅ Сохранено!</div>}
            <div className={styles.form}>
                <label>Телефон</label>
                <input type="text" name="phone" value={settings.phone} onChange={handleChange} />
                <label>Email</label>
                <input type="email" name="email" value={settings.email} onChange={handleChange} />
                <label>Адрес</label>
                <input type="text" name="address" value={settings.address} onChange={handleChange} />
                <label>Режим работы</label>
                <input type="text" name="work_hours" value={settings.work_hours} onChange={handleChange} />
                <label>Текст в футере</label>
                <textarea name="footer_text" value={settings.footer_text} onChange={handleChange} rows={3} />
                <button onClick={handleSave}>Сохранить</button>
            </div>
        </div>
    );
};

export default AdminSettings;