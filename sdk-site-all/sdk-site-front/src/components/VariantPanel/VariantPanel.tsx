import React from 'react';
import styles from './VariantPanel.module.css';

interface SelectedItem {
    id: string;
    dimensions: string;
    woodType: string;
    grade: string;
    price: number;
    quantity: number;
}

interface VariantPanelProps {
    items: SelectedItem[];
    onQuantityChange: (id: string, newQuantity: number) => void;
    onRemoveItem: (id: string) => void;
    onAddToCart: () => void;
}

const VariantPanel: React.FC<VariantPanelProps> = ({
    items,
    onQuantityChange,
    onRemoveItem,
    onAddToCart,
}) => {
    if (items.length === 0) return null;

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className={styles.panel}>
            <div className={styles.headerRow}>
                <span className={styles.colDim}>Размер</span>
                <span className={styles.colWood}>Порода</span>
                <span className={styles.colGrade}>Сорт</span>
                <span className={styles.colPrice}>Цена за м³</span>
                <span className={styles.colQty}>Количество</span>
                <span className={styles.colAction}></span>
            </div>

            {items.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                    <span className={styles.colDim}>{item.dimensions}</span>
                    <span className={styles.colWood}>{item.woodType}</span>
                    <span className={styles.colGrade}>{item.grade}</span>
                    <span className={styles.colPrice}>{item.price} ₽</span>
                    <div className={styles.colQty}>
                        <button 
                            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                            className={styles.qtyBtn}
                        >
                            −
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button 
                            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                            className={styles.qtyBtn}
                        >
                            +
                        </button>
                    </div>
                    <div className={styles.colAction}>
                        <button 
                            onClick={() => onRemoveItem(item.id)}
                            className={styles.removeBtn}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            <div className={styles.actionRow}>
                <span className={styles.total}>
                    Итого: <strong>{totalPrice} ₽</strong>
                </span>
                <button onClick={onAddToCart} className={styles.addBtn}>
                    Добавить в корзину
                </button>
            </div>
        </div>
    );
};

export default VariantPanel;