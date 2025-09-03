'use client';

import React, { ReactNode, useEffect } from 'react'; // 1. Importar useEffect
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 2. Mover a lógica de redirecionamento para um useEffect
  useEffect(() => {
    // A verificação só acontece depois da renderização inicial
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]); // O efeito depende desses valores

  if (isLoading) {
    return <div className="text-center p-8">Verificando autenticação...</div>;
  }

  // 3. Se não estiver carregando e houver um usuário, mostra o conteúdo
  if (user) {
    return <>{children}</>;
  }

  // 4. Se não estiver carregando e NÃO houver usuário, não mostra nada
  //    enquanto o useEffect faz o redirecionamento.
  return null;
}