import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow p-4 pb-20">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
                <div className="flex justify-around max-w-md mx-auto">
                    <a href="#" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                        Rotina
                    </a>
                    <a href="#" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                        Lista Tarefas
                    </a>
                    <a href="#" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                        Desempenho
                    </a>
                </div>
            </nav>
        </div>
    );
}