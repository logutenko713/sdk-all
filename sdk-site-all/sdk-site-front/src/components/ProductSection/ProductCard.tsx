import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductCardProps } from '@types';
import config from '@config/api';
import styles from './ProductSection.module.css';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    const handleMoreDetails = () => {
        navigate('/catalog');
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.cardImageContainer}>
                <img
                    src={`${config.api.baseURL}${product.image}`}
                    alt={product.name}
                    className={styles.productIcon}
                />
            </div>
            <div className={styles.productDesc}>
                <h2 className={styles.productTitle}>{product.name}</h2>
                <button
                    className={styles.sizeBtn}
                    onClick={handleMoreDetails}
                >
                    Подробнее
                </button>
            </div>
        </div>
    );
};

export default ProductCard;