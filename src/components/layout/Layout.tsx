'use client'

import React from 'react';
import Link from 'next/link';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Layout({className, children, ...props }: LayoutProps) {
    return (
        <div className={`bg-gray-900 text-white min-h-screen flex flex-col ${className}`} {...props}>
            <header className="bg-gray-800 border-b border-gray-700">
                <nav className="flex justify-center max-w-4xl mx-auto">
                    <Link href="/" className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors">
                        Rotina
                    </Link>
                    <Link href="#" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                        Lista Tarefas
                    </Link>
                    <Link href="/monitoramento" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                        Monitoramento
                    </Link>
                </nav>
            </header>
            <main className="flex-grow p-4 pb-20">
                {children}
            </main>

        </div>
    );
}