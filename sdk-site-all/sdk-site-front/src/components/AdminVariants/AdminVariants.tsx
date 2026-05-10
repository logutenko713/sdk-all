import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminVariants.module.css';

const API_VARIANTS = 'http://127.0.0.1:8000/api/admin/table1/';
const API_PRODUCTS = 'http://127.0.0.1:8000/api/admin/products/';

const AdminVariants = () => {
    const { token } = useAuth();
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [formData, setFormData] = useState({
        product: '',
        grade: '',
        surface: '',
        width: '',
        thickness: '',
        length: '',
        price_per_m3: '',
        sheets_per_pack: 1,
        is_active: true
    });

    useEffect(() => {
        if (!token) return;
        Promise.all([
            fetch(API_VARIANTS, { headers: { 'Authorization': `Token ${token}` } }).then(res => res.json()),
            fetch(API_PRODUCTS, { headers: { 'Authorization': `Token ${token}` } }).then(res => res.json())
        ]).then(([variantsData, productsData]) => {
            setVariants(Array.isArray(variantsData) ? variantsData : variantsData.results || []);
            setProducts(Array.isArray(productsData) ? productsData : productsData.results || []);
            setLoading(false);
        }).catch(err => { console.error(err); setLoading(false); });
    }, [token]);

    const handleSave = async () => {
        if (!formData.product) {
            alert('Выберите товар из списка');
            return;
        }

        const method = editingVariant ? 'PUT' : 'POST';
        const url = editingVariant ? `${API_VARIANTS}${editingVariant.id}/` : API_VARIANTS;

        const payload = {
            product: parseInt(formData.product),
            grade: formData.grade || null,
            surface: formData.surface || null,
            width: formData.width || null,
            thickness: formData.thickness,
            length: formData.length,
            price_per_m3: formData.price_per_m3,
            sheets_per_pack: parseInt(formData.sheets_per_pack),
            is_active: formData.is_active
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const saved = await response.json();
                if (editingVariant) {
                    setVariants(variants.map(v => v.id === saved.id ? saved : v));
                } else {
                    setVariants([saved, ...variants]);
                }
                closeForm();
            } else {
                const error = await response.text();
                console.error('Ошибка:', error);
                alert('Ошибка сохранения');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка сети');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить вариант?')) return;
        await fetch(`${API_VARIANTS}${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` }
        });
        setVariants(variants.filter(v => v.id !== id));
    };

    const openAddForm = () => {
        setEditingVariant(null);
        setFormData({ product: '', grade: '', surface: '', width: '', thickness: '', length: '', price_per_m3: '', sheets_per_pack: 1, is_active: true });
        setIsFormOpen(true);
    };

    const openEditForm = (variant) => {
        setEditingVariant(variant);
        setFormData({
            product: variant.product?.id || variant.product,
            grade: variant.grade?.name || variant.grade || '',
            surface: variant.surface?.name || variant.surface || '',
            width: variant.width?.value || variant.width || '',
            thickness: variant.thickness,
            length: variant.length,
            price_per_m3: variant.price_per_m3,
            sheets_per_pack: variant.sheets_per_pack,
            is_active: variant.is_active
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingVariant(null);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Управление вариантами товаров</h1>
                <button className={styles.addBtn} onClick={openAddForm}>+ Добавить вариант</button>
            </div>

            {isFormOpen && (
                <div className={styles.form}>
                    <select value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })}>
                        <option value="">Выберите товар</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    <input type="text" placeholder="Сорт" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                    <input type="text" placeholder="Поверхность" value={formData.surface} onChange={e => setFormData({ ...formData, surface: e.target.value })} />
                    <input type="text" placeholder="Ширина (мм)" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} />
                    <input type="text" placeholder="Толщина (мм)" value={formData.thickness} onChange={e => setFormData({ ...formData, thickness: e.target.value })} />
                    <input type="text" placeholder="Длина (м)" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} />
                    <input type="text" placeholder="Цена за м³" value={formData.price_per_m3} onChange={e => setFormData({ ...formData, price_per_m3: e.target.value })} />
                    <input type="number" placeholder="Листов в упаковке" value={formData.sheets_per_pack} onChange={e => setFormData({ ...formData, sheets_per_pack: e.target.value })} />
                    
                    <label className={styles.checkbox}>
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
                        <th>Товар</th>
                        <th>Сорт</th>
                        <th>Поверхность</th>
                        <th>Ширина</th>
                        <th>Толщина</th>
                        <th>Длина</th>
                        <th>Цена</th>
                        <th>Активен</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map(v => (
                        <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>{v.product?.name}</td>
                            <td>{v.grade?.name || v.grade || '—'}</td>
                            <td>{v.surface?.name || v.surface || '—'}</td>
                            <td>{v.width?.value || v.width || '—'} мм</td>
                            <td>{v.thickness} мм</td>
                            <td>{v.length} м</td>
                            <td>{v.price_per_m3} ₽</td>
                            <td>{v.is_active ? '✅' : '❌'}</td>
                            <td>
                                <button onClick={() => openEditForm(v)}>✏️</button>
                                <button onClick={() => handleDelete(v.id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminVariants;