import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const buttonClasses = [
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        className
    ].join(' ');

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};
