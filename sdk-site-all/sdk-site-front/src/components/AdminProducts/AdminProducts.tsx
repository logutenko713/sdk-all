import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminProducts.module.css';

const API_URL = 'http://127.0.0.1:8000/api/admin/products/';

const AdminProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        discount_volume: '',
        is_active: true,
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch(API_URL, { headers: { 'Authorization': `Token ${token}` } })
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : data.results || []);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, [token]);

    const handleDelete = async (id) => {
        if (!confirm('Удалить товар?')) return;
        await fetch(`${API_URL}${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        setProducts(products.filter(p => p.id !== id));
    };

    const handleSave = async () => {
        const method = editingProduct ? 'PUT' : 'POST';
        const url = editingProduct ? `${API_URL}${editingProduct.id}/` : API_URL;

        const bodyData = new FormData();
        bodyData.append('name', formData.name);
        bodyData.append('category', formData.category);
        bodyData.append('description', formData.description);
        bodyData.append('discount_volume', formData.discount_volume);
        bodyData.append('is_active', formData.is_active);
        if (formData.image) bodyData.append('image', formData.image);

        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Token ${token}` },
            body: bodyData
        });

        if (response.ok) {
            const saved = await response.json();
            if (editingProduct) {
                setProducts(products.map(p => p.id === saved.id ? saved : p));
            } else {
                setProducts([saved, ...products]);
            }
            closeForm();
        }
    };

    const openAddForm = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: '', description: '', discount_volume: '', is_active: true, image: null });
        setPreviewImage(null);
        setIsFormOpen(true);
    };

    const openEditForm = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description || '',
            discount_volume: product.discount_volume || '',
            is_active: product.is_active,
            image: null
        });
        setPreviewImage(product.image);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', category: '', description: '', discount_volume: '', is_active: true, image: null });
        setPreviewImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Управление товарами</h1>
                <button className={styles.addBtn} onClick={openAddForm}>+ Добавить товар</button>
            </div>

            {isFormOpen && (
                <div className={styles.form}>
                    <input type="text" placeholder="Название" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input type="text" placeholder="Категория" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <input type="text" placeholder="Объём для скидки (м³)" value={formData.discount_volume} onChange={e => setFormData({ ...formData, discount_volume: e.target.value })} />
                    <label>Активен: <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} /></label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {previewImage && <img src={previewImage} alt="Превью" style={{ width: '100px', marginTop: '10px' }} />}
                    <div className={styles.formButtons}>
                        <button onClick={handleSave}>Сохранить</button>
                        <button onClick={closeForm}>Отмена</button>
                    </div>
                </div>
            )}

            <table className={styles.table}>
                <thead><tr><th>ID</th><th>Название</th><th>Категория</th><th>Активен</th><th>Действия</th></tr></thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.is_active ? '✅' : '❌'}</td>
                            <td>
                                <button onClick={() => openEditForm(product)}>✏️</button>
                                <button onClick={() => handleDelete(product.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProducts;