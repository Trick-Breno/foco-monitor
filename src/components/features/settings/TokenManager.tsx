"use client"; // ESSENCIAL: Isso marca como um Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Verifique este caminho
import { db } from '@/lib/firebase/config'; // Verifique este caminho
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const TokenManager = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Busca o token atual no Firestore
  const fetchToken = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists() && docSnap.data().widgetToken) {
        setToken(docSnap.data().widgetToken);
      } else {
        setToken(null);
      }
    } catch (error) {
      console.error("Erro ao buscar token:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Gera um novo token
  const handleGenerateToken = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
        const newToken = uuidv4();
        const userDocRef = doc(db, 'users', user.uid);
      
        // Salva o novo token no documento do usuário
        // Assumindo que seu documento 'users' existe.
        // Se não existir, use setDoc(userDocRef, { widgetToken: newToken }, { merge: true });
        await setDoc(userDocRef, 
            { widgetToken: newToken }, 
            { merge: true }
        );
      
      setToken(newToken);
    } catch (error) {
      console.error("Erro ao gerar token:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  const widgetUrl = `https://foco-monitor.vercel.app/widget-view?token=${token}`;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Token de Acesso do Widget</h2>
      <p className="text-gray-600 mb-4">
        Este token permite que serviços externos (como o Widgery) visualizem 
        sua rotina ativa. Mantenha-o em segredo.
      </p>

      {token ? (
        <div className="mb-4">
          <p className="font-semibold">Sua URL para o Widget:</p>
          <input
            type="text"
            readOnly
            value={widgetUrl}
            className="w-full p-2 border rounded-md bg-gray-100 mt-2 text-black" // Adicionado text-black
          />
        </div>
      ) : (
        <p className="text-gray-500 mb-4">Nenhum token gerado ainda.</p>
      )}

      <button
        onClick={handleGenerateToken}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? 'Gerando...' : (token ? 'Regenerar Token' : 'Gerar Token')}
      </button>
      {token && (
        <p className="text-sm text-yellow-700 mt-2">
          Gerar um novo token invalidará o antigo.
        </p>
      )}
    </div>
  );
};

export default TokenManager;