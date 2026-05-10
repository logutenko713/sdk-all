import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminCarousel.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/carousel/';
const MEDIA_BASE = 'http://127.0.0.1:8000';

const AdminCarousel = () => {
    const { token } = useAuth();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        image: null,
        is_active: true
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, { headers: { 'Authorization': `Token ${token}` } })
            .then(res => res.json())
            .then(data => {
                setSlides(Array.isArray(data) ? data : data.results || []);
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

    const handleSave = async () => {
        const method = editingSlide ? 'PATCH' : 'POST';
        const url = editingSlide ? `${API_URL}${editingSlide.id}/` : API_URL;

        const body = new FormData();
        
        // Если выбрано новое изображение — отправляем его
        if (formData.image) {
            body.append('image', formData.image);
        }
        body.append('is_active', formData.is_active);

        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Token ${token}` },
            body
        });

        if (response.ok) {
            const saved = await response.json();
            if (editingSlide) {
                setSlides(slides.map(s => s.id === saved.id ? saved : s));
            } else {
                setSlides([saved, ...slides]);
            }
            closeForm();
        } else {
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить слайд?')) return;
        await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        setSlides(slides.filter(s => s.id !== id));
    };

    const toggleActive = async (slide) => {
        const form = new FormData();
        form.append('is_active', !slide.is_active);
        await fetch(`${API_URL}${slide.id}/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Token ${token}` },
            body: form
        });
        setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
    };

    const openAddForm = () => {
        setEditingSlide(null);
        setFormData({ image: null, is_active: true });
        setPreview(null);
        setIsFormOpen(true);
    };

    const openEditForm = (slide) => {
        setEditingSlide(slide);
        setFormData({ image: null, is_active: slide.is_active });
        setPreview(slide.image);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingSlide(null);
        setFormData({ image: null, is_active: true });
        setPreview(null);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Управление слайдами карусели</h1>
                <button className={styles.addBtn} onClick={openAddForm}>+ Добавить слайд</button>
            </div>

            {isFormOpen && (
                <div className={styles.form}>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {preview && (
                        <img 
                            src={preview.startsWith('blob') ? preview : `${MEDIA_BASE}${preview}`} 
                            alt="Превью" 
                            className={styles.preview} 
                        />
                    )}
                    <label>
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
                        <th>Изображение</th>
                        <th>Активен</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {slides.map(slide => (
                        <tr key={slide.id}>
                            <td>{slide.id}</td>
                            <td>
                                {slide.image && (
                                    <img 
                                        src={`${MEDIA_BASE}${slide.image}`}
                                        alt="слайд" 
                                        className={styles.thumbnail} 
                                        onClick={() => setPreviewImage(`${MEDIA_BASE}${slide.image}`)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                            </td>
                            <td>
                                <button onClick={() => toggleActive(slide)}>
                                    {slide.is_active ? '✅' : '❌'}
                                </button>
                            </td>
                            <td>
                                <button onClick={() => openEditForm(slide)}>✏️</button>
                                <button onClick={() => handleDelete(slide.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {previewImage && (
                <div className={styles.modal} onClick={() => setPreviewImage(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <img src={previewImage} alt="Увеличенный слайд" className={styles.modalImage} />
                        <button className={styles.modalClose} onClick={() => setPreviewImage(null)}>✕</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCarousel;