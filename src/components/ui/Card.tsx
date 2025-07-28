import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({className, children, ...props}: CardProps) {
    const baseClasses = 'flex justify-between gap-2 bg-gray-800 rounded-lg p-4 shadow-md';
    const ResponsiveClasses = 'w-full';

    return (
        <div className={`${baseClasses} ${ResponsiveClasses} ${className}`} {...props}>
            {children}
        </div>
    );
}

/*
define a estrutura do card
*/