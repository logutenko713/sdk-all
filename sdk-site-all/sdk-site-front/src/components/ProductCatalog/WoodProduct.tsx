import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { apiService } from '../../services/api';
import styles from './ProductCatalog.module.css';
import VariantPanel from '../VariantPanel/VariantPanel';

type Tab = 'description' | 'price' | 'properties' | 'documents';

interface BoardProductProps {
    productId: number;
    title: string;
}

const BoardProduct: React.FC<BoardProductProps> = ({ productId, title }) => {
    const [activeTab, setActiveTab] = useState<Tab>('price');
    const { addItem, openCart } = useCart();
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
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

    const groupVariants = () => {
        const rowsMap = new Map();
        const colsSet = new Set();

        variants.forEach(v => {
            const width = v.width?.value || v.width;
            const thickness = v.thickness;
            const length = v.length;
            const price = v.price_per_m3;
            const variantId = v.id;
            
            const rowKey = width;
            const colKey = `${thickness}×${length}`;
            
            if (!rowsMap.has(rowKey)) {
                rowsMap.set(rowKey, { width: rowKey, prices: {}, variantIds: {} });
            }
            rowsMap.get(rowKey).prices[colKey] = price;
            rowsMap.get(rowKey).variantIds[colKey] = variantId;
            colsSet.add(colKey);
        });

        return {
            rows: Array.from(rowsMap.values()).sort((a, b) => a.width - b.width),
            cols: Array.from(colsSet).sort()
        };
    };

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
                setSelectedCells(selectedCells.filter(
                    cell => !(cell.row === item.rowIdx && cell.col === item.colIdx)
                ));
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
            setSelectedCells(selectedCells.filter(
                cell => !(cell.row === item.rowIdx && cell.col === item.colIdx)
            ));
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
                woodType: 'Сосна/Ель',
                grade: 'I-III',
                price: item.price,
                stock: 1000,
            };
            
            addItem(product, variant, item.quantity);
        });
        
        setItems([]);
        setSelectedCells([]);
        openCart();
    };

    const handlePriceClick = (rowIdx: number, colIdx: number, price: number, variantId: number, colKey: string, rowWidth: number) => {
        const alreadySelected = selectedCells.some(
            cell => cell.row === rowIdx && cell.col === colIdx
        );
        
        if (alreadySelected) {
            setSelectedCells(selectedCells.filter(
                cell => !(cell.row === rowIdx && cell.col === colIdx)
            ));
        } else {
            setSelectedCells([...selectedCells, { row: rowIdx, col: colIdx }]);
        }
        
        const variantData = {
            id: `board-${rowIdx}-${colIdx}`,
            variantId: variantId,
            productId: productId,
            dimensions: `${rowWidth}×${colKey} мм`,
            woodType: 'Сосна/Ель',
            grade: 'I-III',
            price: price,
            rowIdx: rowIdx,
            colIdx: colIdx,
        };
        
        addOrUpdateItem(variantData);
    };

    if (loading) return <div>Загрузка...</div>;
    if (variants.length === 0) return null;

    const grouped = groupVariants();

    return (
        <main className={styles.container}>
            <div className={styles.productWrap}>
                <div className={styles.leftColumn}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.imagePlaceholder}>
                        <span>Картинка доски</span>
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
                        {activeTab === 'description' && <p>Доска обрезная из хвойных пород.</p>}

                        {activeTab === 'price' && (
                            <div className={styles.priceContent}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <td rowSpan={2}>Сорт</td>
                                            <td rowSpan={2}>Ширина, мм</td>
                                            <td colSpan={grouped.cols.length}>Толщина × Длина, м</td>
                                        </tr>
                                        <tr>
                                            {grouped.cols.map(col => <td key={col}>{col}</td>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grouped.rows.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                <td>I-III</td>
                                                <td>{row.width}</td>
                                                {grouped.cols.map((col, colIdx) => {
                                                    const isSelected = selectedCells.some(cell => cell.row === rowIdx && cell.col === colIdx);
                                                    const price = row.prices[col];
                                                    const variantId = row.variantIds[col];
                                                    return (
                                                        <td
                                                            key={colIdx}
                                                            onClick={() => price && handlePriceClick(rowIdx, colIdx, price, variantId, col, row.width)}
                                                            className={isSelected ? styles.selectedCell : ''}
                                                            style={{ cursor: price ? 'pointer' : 'default' }}
                                                        >
                                                            {price ? `${price} ₽` : '-'}
                                                        </td>
                                                    );
                                                })}
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
                                <li>Порода: сосна, ель</li>
                                <li>Влажность: камерная сушка 8-12%</li>
                                <li>Сорт: 1-3 (отбор)</li>
                            </ul>
                        )}

                        {activeTab === 'documents' && <p>Сертификаты соответствия, паспорт качества.</p>}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default BoardProduct;