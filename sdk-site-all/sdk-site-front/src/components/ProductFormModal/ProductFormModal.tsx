import { useState, useEffect } from 'react';
import styles from './ProductFormModal.module.css';

type ProductType = 'board' | 'plywood' | 'chip' | 'veneer' | 'roundwood';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => void;
    product?: any;
}

const getDefaultFields = (type: ProductType) => {
    switch (type) {
        case 'board':
            return { width: '', thickness: '', length: '', grade: '', pricePerM3: '' };
        case 'plywood':
            return { thickness: '', size: '', grade: '', surface: '', pricePerSheet: '' };
        case 'chip':
            return { type: 'Мешок', price: '' };
        case 'veneer':
            return { pricePerM3: '' };
        case 'roundwood':
            return { diameter: '', length: '', woodType: 'Сосна', pricePerM3: '' };
        default:
            return {};
    }
};

const ProductFormModal = ({ isOpen, onClose, onSave, product }: ProductFormModalProps) => {
    const [productType, setProductType] = useState<ProductType>('board');
    const [name, setName] = useState('');
    const [fields, setFields] = useState<any>({});

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setProductType(product.productType || 'board');
            setFields(product.fields || getDefaultFields(product.productType || 'board'));
        } else {
            resetForm();
        }
    }, [product, isOpen]);

    const resetForm = () => {
        setName('');
        setProductType('board');
        setFields(getDefaultFields('board'));
    };

    const handleFieldChange = (key: string, value: string) => {
        setFields({ ...fields, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newProduct = {
            id: product?.id || Date.now(),
            name,
            productType,
            fields,
            price: fields.pricePerM3 || fields.pricePerSheet || fields.price || 0,
        };
        onSave(newProduct);
        onClose();
        resetForm();
    };

    if (!isOpen) return null;

    const renderFields = () => {
        switch (productType) {
            case 'board':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Ширина (мм)"
                            value={fields.width || ''}
                            onChange={(e) => handleFieldChange('width', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Толщина (мм)"
                            value={fields.thickness || ''}
                            onChange={(e) => handleFieldChange('thickness', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Длина (м)"
                            value={fields.length || ''}
                            onChange={(e) => handleFieldChange('length', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Сорт"
                            value={fields.grade || ''}
                            onChange={(e) => handleFieldChange('grade', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Цена за м³ (₽)"
                            value={fields.pricePerM3 || ''}
                            onChange={(e) => handleFieldChange('pricePerM3', e.target.value)}
                            required
                        />
                    </>
                );
            case 'plywood':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Толщина (мм)"
                            value={fields.thickness || ''}
                            onChange={(e) => handleFieldChange('thickness', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Размер листа (мм)"
                            value={fields.size || ''}
                            onChange={(e) => handleFieldChange('size', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Сорт"
                            value={fields.grade || ''}
                            onChange={(e) => handleFieldChange('grade', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Поверхность"
                            value={fields.surface || ''}
                            onChange={(e) => handleFieldChange('surface', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Цена за лист (₽)"
                            value={fields.pricePerSheet || ''}
                            onChange={(e) => handleFieldChange('pricePerSheet', e.target.value)}
                            required
                        />
                    </>
                );
            case 'chip':
                return (
                    <>
                        <select
                            value={fields.type || 'Мешок'}
                            onChange={(e) => handleFieldChange('type', e.target.value)}
                        >
                            <option value="Мешок">Мешок</option>
                            <option value="м³">м³</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Цена"
                            value={fields.price || ''}
                            onChange={(e) => handleFieldChange('price', e.target.value)}
                            required
                        />
                    </>
                );
            case 'veneer':
                return (
                    <input
                        type="number"
                        placeholder="Цена за м³ (₽)"
                        value={fields.pricePerM3 || ''}
                        onChange={(e) => handleFieldChange('pricePerM3', e.target.value)}
                        required
                    />
                );
            case 'roundwood':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Диаметр (см)"
                            value={fields.diameter || ''}
                            onChange={(e) => handleFieldChange('diameter', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Длина (м)"
                            value={fields.length || ''}
                            onChange={(e) => handleFieldChange('length', e.target.value)}
                            required
                        />
                        <select
                            value={fields.woodType || 'Сосна'}
                            onChange={(e) => handleFieldChange('woodType', e.target.value)}
                        >
                            <option value="Сосна">Сосна</option>
                            <option value="Ель">Ель</option>
                            <option value="Берёза">Берёза</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Цена за м³ (₽)"
                            value={fields.pricePerM3 || ''}
                            onChange={(e) => handleFieldChange('pricePerM3', e.target.value)}
                            required
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <h2>{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Название товара"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <select
                        value={productType}
                        onChange={(e) => {
                            setProductType(e.target.value as ProductType);
                            setFields(getDefaultFields(e.target.value as ProductType));
                        }}
                    >
                        <option value="board">Доска обрезная</option>
                        <option value="plywood">Фанера</option>
                        <option value="chip">Щепа</option>
                        <option value="veneer">Шпон</option>
                        <option value="roundwood">Круглый лес</option>
                    </select>

                    {renderFields()}

                    <div className={styles.buttons}>
                        <button type="button" onClick={onClose}>Отмена</button>
                        <button type="submit">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;