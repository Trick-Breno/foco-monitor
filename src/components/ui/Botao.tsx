import React from 'react';

interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secundary';
};

export function Botao({children, className, variant = 'primary', ...props }: BotaoProps) {
    const baseStyle = 'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200';
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
        secundary: 'bg-transparent border border-gray-500 hover:bg-gray-700',
    };

    return (
        <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}