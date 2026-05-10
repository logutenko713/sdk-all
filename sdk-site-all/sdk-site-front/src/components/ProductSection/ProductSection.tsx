import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@contexts/CartContext';
import { Flip, toast } from 'react-toastify';
import type { Product } from '@types';
import ProductCard from './ProductCard';
import { apiService } from '@services/api';
import styles from './ProductSection.module.css';

const ProductSection: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProducts = async () => {
        try {
            const data = await apiService.getProducts();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка загрузки товаров:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        const intervalId = setInterval(() => {
            fetchProducts();
        }, 30000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <section className={styles.productSection}>
                <h1 className={styles.productSectionName}>Продукция</h1>
                <div className={styles.container}>
                    <div className={styles.skeletonGrid}>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage}></div>
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonText}></div>
                                    <div className={styles.skeletonButton}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.productSection}>
            <h1 className={styles.productSectionName}>Продукция</h1>
            <div className={styles.container}>
                <div className={styles.productGrid}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductSection;