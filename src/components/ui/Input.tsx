import React from 'react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className={styles.inputGroup}>
            {label && <label className={styles.label}>{label}</label>}
            <input className={`${styles.input} ${className}`} {...props} />
        </div>
    );
};
