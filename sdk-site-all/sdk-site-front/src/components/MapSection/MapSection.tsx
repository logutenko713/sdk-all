import React, { useEffect, useRef, useState } from 'react';
import styles from './MapSection.module.css';

declare global {
    interface Window {
        ymaps: any;
    }
}

const MapSection: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const companyCoordinates = [56.624173, 85.057405];
    const apiKey = 'bb1a5b34-ca4a-48d4-a21f-6ee89d52048d';

    useEffect(() => {
        if (window.ymaps) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;

        script.onload = () => {
            window.ymaps.ready(() => {
                initMap();
            });
        };

        script.onerror = () => {
            console.error('Failed to load Yandex Maps');
            setLoadError(true);
        };

        document.head.appendChild(script);

        return () => {
            if (map) {
                map.destroy();
            }
        };
    }, []);

    const initMap = () => {
        if (!mapRef.current || !window.ymaps) return;

        try {
            const newMap = new window.ymaps.Map(mapRef.current, {
                center: companyCoordinates,
                zoom: 16,
                controls: ['zoomControl', 'fullscreenControl']
            });

            const placemark = new window.ymaps.Placemark(companyCoordinates, {
                balloonContent: 'Томск, Кузовлевский тракт, 2Бс31'
            });

            newMap.geoObjects.add(placemark);
            setMap(newMap);
            setIsLoaded(true);
        } catch (error) {
            console.error('Error initializing map:', error);
            setLoadError(true);
        }
    };

    if (loadError) {
        return (
            <section className={styles.mapSection}>
                <div className={styles.container}>
                    <div className={styles.mapHeader}>
                        <h2 className={styles.mapTitle}>Наш склад</h2>
                        <p className={styles.mapSubtitle}>
                            Приезжайте забирать товар сами по адресу: Томск, ул. Кузовлевский тракт, 2Бс31
                        </p>
                    </div>
                    <div className={styles.mapContainer}>
                        <div className={styles.mapPlaceholder}>
                            Карта временно недоступна
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.mapSection}>
            <div className={styles.container}>
                <div className={styles.contactsBlock}>
                    <h2 className={styles.title}>Наш склад</h2>
                    <div className={styles.contactsInfo}>
                        <div className={styles.contactItem}>
                            <span className={styles.icon}>📍</span>
                            <span>г. Томск, ул. Кузовлевский тракт, 2Б ст31</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.icon}>📞</span>
                            <span>+7 (888) 888-88-88</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.icon}>🕒</span>
                            <span>Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.icon}>✉️</span>
                            <span>adress_email.ru</span>
                        </div>
                    </div>
                </div>
                <div className={styles.mapWrapper}>
                    <div
                        ref={mapRef}
                        className={styles.mapContainer}
                        style={{ width: '100%', height: '400px', borderRadius: '12px' }}
                    >
                        {!isLoaded && <div className={styles.mapPlaceholder}>Загрузка карты...</div>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MapSection;