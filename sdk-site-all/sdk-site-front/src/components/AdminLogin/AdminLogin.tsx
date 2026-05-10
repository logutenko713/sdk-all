import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('admin_token', data.token);
                navigate('/admin');
            } else {
                setError(data.error || 'Неверный логин или пароль');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Вход в админ-панель</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ 
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '8px', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: '#925343',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;