'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '../auth/AuthGuard';
import { Botao } from '../ui/Botao';
import { usePathname } from 'next/navigation'; // 1. Importar o usePathname

type LayoutProps = React.HTMLAttributes<HTMLDivElement>;

export function Layout({ className, children, ...props }: LayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // 2. Pegar o caminho da URL atual

  // 3. Definir quais páginas são públicas
  const publicPaths = ['/login','/widget-view'];;
  const isPublicPage = publicPaths.includes(pathname);

  // 4. Se for uma página pública, renderiza um layout mínimo
  if (isPublicPage) {
    return (
      <div className={`bg-gray-900 text-white min-h-screen ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  // 5. Se não for pública, renderiza o layout completo e protegido
  return (
    <div
      className={`bg-gray-900 text-white min-h-screen flex flex-col ${className}`}
      {...props}
    >
      <AuthGuard>
        <main className="flex-grow p-4 pb-20">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
          <div className="flex justify-center items-center max-w-4xl mx-auto">
            <Link
              href="/"
              className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors"
            >
              Central de Tarefas
            </Link>

            <Link
              href="/monitoramento"
              className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors"
            >
              Progresso
            </Link>

            <Link
              href="/settings"
              className="p-4 text-center text-sm w-full hover:bg-gray-700 transition-colors"
            >
              Config
            </Link>

            {user && (
              <div className="p-2">
                <Botao onClick={logout} variant="secondary" className="text-xs px-2 py-1">
                  Sair
                </Botao>
              </div>
            )}
          </div>
        </nav>
      </AuthGuard>
    </div>
  );
}