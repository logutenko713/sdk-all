import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { apiService } from '../../services/api';
import styles from './ProductCatalog.module.css';
import VariantPanel from '../VariantPanel/VariantPanel';

type Tab = 'description' | 'price' | 'properties' | 'documents';

interface ChipProductProps {
    productId: number;
    title: string;
}

const ChipProduct: React.FC<ChipProductProps> = ({ productId, title }) => {
    const [activeTab, setActiveTab] = useState<Tab>('price');
    const { addItem, openCart } = useCart();
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        apiService.getProductVariants(productId)
            .then(data => {
                setVariants(data);
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
            const item = items.find(item => item.id === id);
            if (item) {
                setSelectedRows(selectedRows.filter(row => row !== item.rowIdx));
            }
            setItems(items.filter(item => item.id !== id));
        } else {
            setItems(items.map(item => 
                item.id === id ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const removeItem = (id: string) => {
        const item = items.find(item => item.id === id);
        if (item) {
            setSelectedRows(selectedRows.filter(row => row !== item.rowIdx));
        }
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
                dimensions: item.dimensions,
                woodType: 'Щепа',
                grade: '—',
                price: item.price,
                stock: 1000,
            };
            
            addItem(product, variant, item.quantity);
        });
        
        setItems([]);
        setSelectedRows([]);
        openCart();
    };

    const handlePriceClick = (rowIdx: number, variant: any) => {
        const alreadySelected = selectedRows.includes(rowIdx);
        
        if (alreadySelected) {
            setSelectedRows(selectedRows.filter(row => row !== rowIdx));
        } else {
            setSelectedRows([...selectedRows, rowIdx]);
        }
        
        const variantData = {
            id: `chip-${rowIdx}`,
            variantId: variant.id,
            productId: productId,
            dimensions: variant.name || title,
            woodType: 'Щепа',
            grade: '—',
            price: variant.price_per_m3 || variant.price,
            rowIdx: rowIdx,
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
                        <span>Картинка щепы</span>
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
                        {activeTab === 'description' && <p>Щепа древесная для мульчирования и топлива. Экологически чистый материал.</p>}

                        {activeTab === 'price' && (
                            <div className={styles.priceContent}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Продукция</th>
                                            <th>Измерение</th>
                                            <th>Цена за ед.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant, idx) => (
                                            <tr key={idx}>
                                                <td>{variant.name || title}</td>
                                                <td>{variant.unit || 'м³'}</td>
                                                <td 
                                                    onClick={() => handlePriceClick(idx, variant)}
                                                    className={selectedRows.includes(idx) ? styles.selectedCell : ''}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {variant.price_per_m3 || variant.price} ₽
                                                </td>
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
                                <li>Фракция: 10-30 мм</li>
                                <li>Влажность: до 15%</li>
                                <li>Порода: хвойные/лиственные</li>
                            </ul>
                        )}

                        {activeTab === 'documents' && <p>Сертификат на топливную щепу, результаты испытаний.</p>}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ChipProduct;