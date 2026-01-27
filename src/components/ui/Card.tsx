import React from 'react';
import styles from './Card.module.scss';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '' }) => {
    return (
        <div className={`${styles.card} ${className}`}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {children}
        </div>
    );
};
