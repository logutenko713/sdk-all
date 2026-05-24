import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import styles from './FeedbackCarousel.module.css';
import sawIcon from '@assets/saw-dot.svg';

const FeedbackCarousel: React.FC = () => {
    const [slides, setSlides] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        apiService.getCarousel()
            .then(data => {
                console.log('Загружено слайдов:', data.length);
                setSlides(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const totalSlides = slides.length + 1;

    useEffect(() => {
        if (!isAutoPlaying || totalSlides === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, totalSlides]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    const goToSlide = (index: number) => setCurrentSlide(index);

    const dots = Array.from({ length: totalSlides }, (_, i) => i);

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0 && value[0] !== '7') value = '7' + value;
        setPhone(value.substring(0, 11));
    };

    const formatPhoneForDisplay = (phone: string): string => {
        if (!phone) return '';
        let digits = phone.replace(/\D/g, '');
        if (!digits || digits[0] !== '7') return digits;
        digits = digits.substring(1);
        const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
        if (!match) return `+7 ${digits}`;
        const [, p1, p2, p3, p4] = match;
        let formatted = '+7';
        if (p1) formatted += ` (${p1}`;
        if (p2) formatted += `) ${p2}`;
        if (p3) formatted += `-${p3}`;
        if (p4) formatted += `-${p4}`;
        return formatted;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || phone.length !== 11) {
            alert('Пожалуйста, заполните ФИО и номер телефона');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/callbacks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: phone,
                    full_name: fullName
                })
            });

            if (response.ok) {
                alert('Заявка отправлена! Мы свяжемся с вами.');
                setFullName('');
                setPhone('');
            } else {
                alert('Ошибка отправки. Попробуйте позже.');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlide = (index: number) => {
        if (index === 0) {
            return (
                <div className={styles.callbackSlide}>
                    <div className={styles.callbackLeft}>
                        <h2 className={styles.callbackTitle}>Нужна консультация?</h2>
                        <p className={styles.callbackSubtitle}>
                            Оставьте свои данные — мы перезвоним и ответим на все вопросы
                        </p>
                    </div>
                    <form className={styles.callbackForm} onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="ФИО"
                            value={fullName}
                            onChange={handleFullNameChange}
                            className={styles.callbackInput}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="+7 (___) ___-__-__"
                            value={formatPhoneForDisplay(phone)}
                            onChange={handlePhoneChange}
                            className={styles.callbackInput}
                            required
                        />
                        <button type="submit" className={styles.callbackButton} disabled={isSubmitting}>
                            {isSubmitting ? 'Отправка...' : 'Обратный звонок'}
                        </button>
                    </form>
                </div>
            );
        }
        
        const slide = slides[index - 1];
        const imageUrl = slide?.image ? `http://127.0.0.1:8000${slide.image}` : null;
        
        return (
            <div className={styles.imageSlide}>
                {imageUrl ? (
                    <img src={imageUrl} alt="Слайд" className={styles.slideImage} />
                ) : (
                    <div className={styles.placeholderSlide}>Слайд {index}</div>
                )}
            </div>
        );
    };

    if (loading) return <div>Загрузка карусели...</div>;

    return (
        <section
            className={styles.carouselSection}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className={styles.container}>
                <div className={styles.carousel}>
                    <div className={styles.slidesContainer}>
                        {dots.map((index) => (
                            <div
                                key={index}
                                className={`${styles.slide} ${currentSlide === index ? styles.active : ''}`}
                            >
                                {renderSlide(index)}
                            </div>
                        ))}
                    </div>

                    <div className={styles.carouselControls}>
                        <button className={styles.controlButton} onClick={prevSlide}>‹</button>
                        <div className={styles.dots}>
                            {dots.map((index) => (
                                <button
                                    key={index}
                                    className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                                    onClick={() => goToSlide(index)}
                                >
                                    {currentSlide === index && (
                                        <img src={sawIcon} alt="Активный слайд" className={styles.sawIcon} />
                                    )}
                                </button>
                            ))}
                        </div>
                        <button className={styles.controlButton} onClick={nextSlide}>›</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeedbackCarousel;