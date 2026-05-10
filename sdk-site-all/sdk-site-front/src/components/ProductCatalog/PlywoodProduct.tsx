import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { apiService } from '../../services/api';
import styles from './ProductCatalog.module.css';
import VariantPanel from '../VariantPanel/VariantPanel';

type Tab = 'description' | 'price' | 'properties' | 'documents';

interface PlywoodProductProps {
    productId: number;
    title: string;
}

const PlywoodProduct: React.FC<PlywoodProductProps> = ({ productId, title }) => {
    const [activeTab, setActiveTab] = useState<Tab>('price');
    const { addItem, openCart } = useCart();
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        apiService.getProductVariants(productId)
            .then(data => {
                // Убираем дубликаты по толщине
                const unique = [];
                const seen = new Set();
                for (const v of data) {
                    if (!seen.has(v.thickness)) {
                        seen.add(v.thickness);
                        unique.push(v);
                    }
                }
                setVariants(unique);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [productId]);

    const addOrUpdateItem = (variantData: any) => {
        const existingIndex = items.findIndex(item => item.id === variantData.id);
        if (existingIndex >= 0) {
            const updated = [...items];
            updated[existingIndex].quantity += 1;
            setItems(updated);
        } else {
            setItems([...items, { ...variantData, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setItems(items.filter(item => item.id !== id));
        } else {
            setItems(items.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleAddToCartFinal = () => {
        if (items.length === 0) return;
        
        items.forEach(item => {
            const product = {
                id: productId,
                name: title,
                image: '',
            };
            
            const variant = {
                id: item.variantId,
                dimensions: `${item.thickness}×1525×1525 мм`,
                woodType: 'Берёза',
                grade: '—',
                price: item.price,
                stock: 1000,
            };
            
            addItem(product, variant, item.quantity);
        });
        
        setItems([]);
        setSelectedCell(null);
        openCart();
    };

    const handlePriceClick = (variant: any, idx: number) => {
        setSelectedCell(idx);
        
        const variantData = {
            id: `plywood-${idx}`,
            variantId: variant.id,
            productId: productId,
            thickness: variant.thickness,
            price: variant.price_per_m3,
            rowIdx: idx,
            colIdx: 0,
        };
        
        addOrUpdateItem(variantData);
    };

    if (loading) return <div>Загрузка...</div>;
    if (variants.length === 0) return null;

    return (
        <main className={styles.container}>
            <div className={styles.productWrap}>
                <div className={styles.leftColumn}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.imagePlaceholder}>
                        <span>Картинка фанеры</span>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <nav className={styles.nav}>
                        <button className={`${styles.navItem} ${activeTab === 'description' ? styles.active : ''}`} onClick={() => setActiveTab('description')}>Описание</button>
                        <button className={`${styles.navItem} ${activeTab === 'price' ? styles.active : ''}`} onClick={() => setActiveTab('price')}>Прайс</button>
                        <button className={`${styles.navItem} ${activeTab === 'properties' ? styles.active : ''}`} onClick={() => setActiveTab('properties')}>Свойства</button>
                        <button className={`${styles.navItem} ${activeTab === 'documents' ? styles.active : ''}`} onClick={() => setActiveTab('documents')}>Документы</button>
                    </nav>

                    <div className={styles.content}>
                        {activeTab === 'description' && <p>Фанера берёзовая повышенной водостойкости.</p>}

                        {activeTab === 'price' && (
                            <div className={styles.priceContent}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Толщина, мм</th>
                                            <th>Цена за м³, ₽</th>
                                            <th>Количество листов в упаковке</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant, idx) => (
                                            <tr key={idx}>
                                                <td>{variant.thickness}</td>
                                                <td 
                                                    onClick={() => handlePriceClick(variant, idx)}
                                                    className={selectedCell === idx ? styles.selectedCell : ''}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {variant.price_per_m3}
                                                </td>
                                                <td>{variant.sheets_per_pack || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <VariantPanel
                                    items={items}
                                    onQuantityChange={updateQuantity}
                                    onRemoveItem={removeItem}
                                    onAddToCart={handleAddToCartFinal}
                                />
                            </div>
                        )}

                        {activeTab === 'properties' && (
                            <ul>
                                <li>Порода: берёза</li>
                                <li>Класс эмиссии: E1</li>
                                <li>Формат листа: 1525х1525 мм</li>
                                <li>Влажность: 5-10%</li>
                            </ul>
                        )}

                        {activeTab === 'documents' && <p>Сертификаты соответствия, паспорт качества на фанеру.</p>}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PlywoodProduct;