'use client';

import React from 'react';
import Link from 'next/link';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Layout({ className, children, ...props }: LayoutProps) {
  return (
    <div
      className={`bg-gray-900 text-white min-h-screen flex flex-col ${className}`}
      {...props}
    >
      <main className="flex-grow p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-center max-w-4xl mx-auto">
            <Link href="/" className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors">
                Central de Tarefas
            </Link>
            <Link href="#" className="p-4 text-center text-sm w-full hover:bg-gray-700">
                Lista Tarefas
            </Link>

          <Link
            href="/monitoramento"
            className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors"
          >
            Monitoramento
          </Link>
        </div>
      </nav>
    </div>
  );
}