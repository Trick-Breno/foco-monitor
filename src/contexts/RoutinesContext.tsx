'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTasks } from './TasksContext';
import {Rotina, StatusRotina} from '@/types';
import { db } from '@/lib/firebase/config';
import { useAuth } from './AuthContext';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  addDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';

interface RoutinesContextType {
  activeRoutine: Rotina | null;
  isLoading: boolean;
  handleCreateRoutine: () => void;
  handleStartRoutine: (routineId: string) => void;
  handleCompleteRoutine: (routineId: string) => void;
}

// analisar em manter isLoading no monitoramento e routinecontroller
const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

interface RoutinesProviderProps {
  children: ReactNode;
}

export function RoutinesProvider({ children }: RoutinesProviderProps) {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [activeRoutine, setActiveRoutine] = useState<Rotina | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!user) {
        setActiveRoutine(null);
        setIsLoading(false);
        return;
      }

    const routinesQuery = query(
      collection(db, 'routines'),
      where('usuarioId', '==', user.uid),
      where('status', 'in', ['criada', 'em andamento']),
      limit(1)
    );

    const unsubscribe = onSnapshot(routinesQuery, (snapshot) => {
      if (snapshot.empty) {
        setActiveRoutine(null);
      } else {
        const routineData = {
          rotinaId: snapshot.docs[0].id,
          ...(snapshot.docs[0].data() as Omit<Rotina, 'rotinaId'>),
        };
        setActiveRoutine(routineData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro no listener de rotinas:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateRoutine = async () => {
    if (!user) return;
    if (activeRoutine) {
      alert('Já existe uma rotina. Conclua a rotina atual para criar uma nova.');
      return;
    }
    const newRoutine: Omit<Rotina, 'rotinaId'> = {
      usuarioId: user.uid,
      data: Timestamp.now(),
      status: 'criada',
      duracaoSegundos: 0,
      totalTarefas: 0,
      tarefasConcluidas: 0,
    };
    try {
      await addDoc(collection(db, 'routines'), newRoutine);
    } catch (error) {
      console.error('Erro ao criar nova rotina:', error);
    }
  };

  const handleStartRoutine = async (routineId: string) => {
    const routineDocRef = doc(db, 'routines', routineId);
    try {
      await updateDoc(routineDocRef, {
        status: 'em andamento' as StatusRotina,
        inicioRotina: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao iniciar rotina:', error);
    }
  };

  const handleCompleteRoutine = async (routineId: string) => {
    if (tasks.some((task) => task.status === 'em andamento')){
      alert('Antes de encerrar a rotina, finalize a tarefa em andamento.');
      return;
    }
    const routineDocRef = doc(db, 'routines', routineId);
    const routineToComplete = activeRoutine;
    if (!routineToComplete || !routineToComplete.inicioRotina) return;
    
    const startTime = routineToComplete.inicioRotina.toDate().getTime();
    const endTime = Date.now();
    const durationInSeconds = Math.round((endTime - startTime) / 1000);

    try {
      await updateDoc(routineDocRef, {
        status: 'concluida' as StatusRotina,
        fimRotina: serverTimestamp(),
        duracaoSegundos: durationInSeconds,
      });
    } catch (error) {
      console.error('Erro ao concluir rotina:', error);
    }
  };

  const value = {
    activeRoutine,
    isLoading,
    handleCreateRoutine,
    handleStartRoutine,
    handleCompleteRoutine,
  };

  return <RoutinesContext.Provider value={value}>{children}</RoutinesContext.Provider>;
}

export function useRoutines() {
  const context = useContext(RoutinesContext);
  if (context === undefined) {
    throw new Error('useRoutines deve ser usado dentro de um RoutinesProvider');
  }
  return context;
}