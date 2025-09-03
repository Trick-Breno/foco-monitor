'use client';

import React, { useEffect } from 'react'; // 1. Importar useEffect
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Botao } from '@/components/ui/Botao';

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  // 2. Mover a lógica de redirecionamento para um useEffect
  useEffect(() => {
    if (user) {
      router.push('/'); // Se o usuário já está logado, redireciona para a home
    }
  }, [user, router]);

  // Se o usuário existir, este return não importa muito, pois o useEffect
  // irá redirecioná-lo após a renderização. Retornar null é uma boa prática.
  if (user) {
    return null;
  }

  // A UI da página de login que será mostrada para usuários não logados
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Foco Monitor</h1>
      <p className="text-gray-400 mb-8">
        Faça login com sua conta Google para continuar.
      </p>
      <Botao onClick={signInWithGoogle} className="px-8 py-4 text-lg">
        Entrar com Google
      </Botao>
    </div>
  );
}