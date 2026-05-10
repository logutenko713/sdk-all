import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminDocs.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/documentation/';
const MEDIA_BASE = 'http://127.0.0.1:8000';

const AdminDocs = () => {
    const { token } = useAuth();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        pdf_file: null,
        is_active: true
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, { headers: { 'Authorization': `Token ${token}` } })
            .then(res => res.json())
            .then(data => {
                setDocs(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, [token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, pdf_file: file });
        }
    };

    const handleSave = async () => {
        const method = editingDoc ? 'PATCH' : 'POST';
        const url = editingDoc ? `${API_URL}${editingDoc.id}/` : API_URL;

        const body = new FormData();
        body.append('name', formData.name);
        if (formData.image) body.append('image', formData.image);
        if (formData.pdf_file) body.append('pdf_file', formData.pdf_file);
        body.append('is_active', formData.is_active);

        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Token ${token}` },
            body
        });

        if (response.ok) {
            const saved = await response.json();
            if (editingDoc) {
                setDocs(docs.map(d => d.id === saved.id ? saved : d));
            } else {
                setDocs([saved, ...docs]);
            }
            closeForm();
        } else {
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить документ?')) return;
        await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        setDocs(docs.filter(d => d.id !== id));
    };

    const openAddForm = () => {
        setEditingDoc(null);
        setFormData({ name: '', image: null, pdf_file: null, is_active: true });
        setPreview(null);
        setIsFormOpen(true);
    };

    const openEditForm = (doc) => {
        setEditingDoc(doc);
        setFormData({
            name: doc.name,
            image: null,
            pdf_file: null,
            is_active: doc.is_active
        });
        setPreview(doc.image);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingDoc(null);
        setFormData({ name: '', image: null, pdf_file: null, is_active: true });
        setPreview(null);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Управление документацией</h1>
                <button className={styles.addBtn} onClick={openAddForm}>+ Добавить документ</button>
            </div>

            {isFormOpen && (
                <div className={styles.form}>
                    <input type="text" placeholder="Название документа" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    
                    <label className={styles.label}>Изображение (превью)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {preview && <img src={preview} alt="Превью" className={styles.preview} />}
                    
                    <label className={styles.label}>PDF файл</label>
                    <input type="file" accept="application/pdf" onChange={handleFileChange} />
                    
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                        Активен
                    </label>
                    <div className={styles.formButtons}>
                        <button onClick={handleSave}>Сохранить</button>
                        <button onClick={closeForm}>Отмена</button>
                    </div>
                </div>
            )}

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Превью</th>
                        <th>PDF</th>
                        <th>Активен</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.map(doc => (
                        <tr key={doc.id}>
                            <td>{doc.id}</td>
                            <td>{doc.name}</td>
                            <td>
                                {doc.image && <img src={`${MEDIA_BASE}${doc.image}`} alt="превью" className={styles.thumbnail} />}
                            </td>
                            <td>
                                {doc.pdf_url && <a href={`${MEDIA_BASE}${doc.pdf_url}`} target="_blank" rel="noopener noreferrer">📄 PDF</a>}
                            </td>
                            <td>
                                <button onClick={() => {
                                    fetch(`${API_URL}${doc.id}/`, {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Token ${token}`
                                        },
                                        body: JSON.stringify({ is_active: !doc.is_active })
                                    }).then(() => {
                                        setDocs(docs.map(d => d.id === doc.id ? { ...d, is_active: !d.is_active } : d));
                                    });
                                }}>
                                    {doc.is_active ? '✅' : '❌'}
                                </button>
                            </td>
                            <td>
                                <button onClick={() => openEditForm(doc)}>✏️</button>
                                <button onClick={() => handleDelete(doc.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDocs;