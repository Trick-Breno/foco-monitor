'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/config';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        
        const allowedEmailsRef = collection(db, 'allowedEmails');
        const q = query(allowedEmailsRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // 2. Email não está na lista, força o logout
          alert('Acesso não autorizado. Este e-mail não tem permissão.');
          await signOut(auth); // Desloga diretamente
          setUser(null);
        } else {
          // 3. Email está na lista, define o usuário
          setUser(currentUser);
        }
      } else {
        // 4. Nenhum usuário está logado
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 5. A função de login agora SÓ faz o login.
      // A verificação acontecerá no onAuthStateChanged.
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Garante que o estado seja limpo imediatamente
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    isLoading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}