"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { WidgetStatus } from './page';
import {WidgetDisplay} from '@/components/features/widget/WidgetDisplay'
import { Rotina, Tarefa } from '@/types'; // <--- CORRIGIDO: Importando seus tipos

const WidgetLoader = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routine, setRoutine] = useState<Rotina | null>(null); // <--- CORRIGIDO: Tipo Rotina
  const [tasks, setTasks] = useState<Tarefa[]>([]); // <--- CORRIGIDO: Tipo Tarefa

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Token de acesso não fornecido.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Encontrar o usuário pelo token
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('widgetToken', '==', token), limit(1));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setError("Token inválido ou expirado.");
          setIsLoading(false);
          return;
        }

        const userId = userSnapshot.docs[0].id;

        // 2. Encontrar a rotina "em andamento" do usuário
        const routinesRef = collection(db, 'routines');
        const routineQuery = query(
          routinesRef,
          where('usuarioId', '==', userId),
          where('status', '==', 'em andamento'), // <--- CORRIGIDO: Lógica do status
          limit(1)
        );
        const routineSnapshot = await getDocs(routineQuery);

        if (routineSnapshot.empty) {
          setError("Nenhuma rotina 'em andamento' encontrada."); // <--- CORRIGIDO: Mensagem de erro
          setIsLoading(false);
          return;
        }

        const routineDoc = routineSnapshot.docs[0];
        const routineData = {
            ...routineDoc.data(),
            id: routineDoc.id // Usamos 'id' internamente no React, mas é o rotinaId
        } as Rotina & { id: string }; // Combinamos o tipo com um 'id'
        
        // No seu tipo, 'id' não existe, então vamos garantir que pegamos o rotinaId
        routineData.rotinaId = routineDoc.id; 
        setRoutine(routineData);

        // 3. Buscar as tarefas dessa rotina
        const tasksRef = collection(db, 'tasks');
        const tasksQuery = query(
          tasksRef,
          where('rotinaId', '==', routineData.rotinaId) // <--- CORRIGIDO: Usando rotinaId
        );
        const tasksSnapshot = await getDocs(tasksQuery);

        const tasksList = tasksSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id, // Usamos 'id' para a 'key' do React
          tarefaId: doc.id, // Guardamos a referência correta
        })) as (Tarefa & { id: string })[]; // <--- CORRIGIDO: Tipo Tarefa
        
        // Ordenar tarefas: pendentes primeiro
        tasksList.sort((a, b) => {
          // Mapeia o status para um valor numérico de ordenação
          const statusOrder = {
            'em andamento': 1,
            'pendente': 2,
            'concluida': 3,
          };

          // Regra 1 e parte da 2 e 3: Ordena por status
          if (statusOrder[a.status] < statusOrder[b.status]) return -1;
          if (statusOrder[a.status] > statusOrder[b.status]) return 1;

          // Se os status são os mesmos, aplica as regras secundárias
          // Regra 2: Pendentes são ordenadas pela data de criação (mais antiga primeiro)
          if (a.status === 'pendente') {
            const dateA = a.dataCriacao?.toMillis() || 0;
            const dateB = b.dataCriacao?.toMillis() || 0;
            return dateA - dateB; // Ordem ascendente
          }

          // Regra 3: Concluídas são ordenadas pela data de conclusão (mais nova primeiro)
          if (a.status === 'concluida') {
            const dateA = a.fimTarefa?.toMillis() || 0;
            const dateB = b.fimTarefa?.toMillis() || 0;
            return dateB - dateA; // Ordem descendente
          }

          return 0; // Mantém a ordem se nenhuma regra se aplicar
        });


        setTasks(tasksList);
        
      } catch (err) {
        console.error("Erro ao buscar dados do widget:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return <WidgetStatus message="Buscando dados..." />;
  }

  if (error) {
    return <WidgetStatus message={error} />;
  }

  if (!routine) {
    return <WidgetStatus message="Nenhuma rotina para exibir." />;
  }

  return <WidgetDisplay routine={routine} tasks={tasks} />;
};

export default WidgetLoader;