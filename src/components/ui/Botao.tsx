import React from 'react';

interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
};

export function Botao({children, className, variant = 'primary', ...props }: BotaoProps) {
    const baseStyle = 'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200';
    const variantStyles = {
        primary: 'bg-violet-800 hover:bg-blue-700 disabled:bg-gray-700',
        secondary: 'bg-transparent border border-gray-500 hover:bg-gray-700',
    };

    return (
        <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}