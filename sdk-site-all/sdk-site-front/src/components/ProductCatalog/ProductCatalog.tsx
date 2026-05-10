import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import BoardProduct from './WoodProduct';
import PlywoodProduct from './PlywoodProduct';
import ChipProduct from './ChipProduct';
import VeneerProduct from './VeneerProduct';
import styles from './ProductCatalog.module.css';

interface Product {
    id: number;
    name: string;
}

const ProductCatalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.getProducts()
            .then(setProducts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className={styles.catalogContainer}>
            <h1 className={styles.title}>Каталог</h1>
            {products.map(product => {
                const name = product.name.toLowerCase();
                if (name.includes('доска')) {
                    return <BoardProduct key={product.id} productId={product.id} title={product.name} />;
                }
                if (name.includes('фанера')) {
                    return <PlywoodProduct key={product.id} productId={product.id} title={product.name} />;
                }
                if (name.includes('щепа')) {
                    return <ChipProduct key={product.id} productId={product.id} title={product.name} />;
                }
                if (name.includes('шпон')) {
                    return <VeneerProduct key={product.id} productId={product.id} title={product.name} />;
                }
                return null;
            })}
        </div>
    );
};

export default ProductCatalog;