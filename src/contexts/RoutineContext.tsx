'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tarefa, StatusTarefa, SubStatusTarefa } from '@/types';
import { db } from '@/lib/firebase/config';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

interface RoutineContextType {
  tasks: Tarefa[];
  isAnyTaskActive: boolean;
  handleStartTask: (taskId: string) => void;
  handlePauseTask: (taskId: string) => void;
  handleResumeTask: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

interface RoutineProviderProps {
  children: ReactNode;
}

export function RoutineProvider({ children }: RoutineProviderProps) {
  const [tasks, setTasks] = useState<Tarefa[]>([]);

  useEffect(() => {
    const tasksCollectionRef = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        tarefaId: doc.id,
        ...(doc.data() as Omit<Tarefa, 'tarefaId'>),
      }));
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, []);

  const handleStartTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        status: 'em andamento',
        subStatus: 'rodando',
        inicioTarefa: serverTimestamp(),
        duracaoSegundos: 0,
        duracaoPausas: 0,
      });
    } catch (error) {
      console.error('Erro ao iniciar tarefa:', error);
    }
  };

  const handlePauseTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    const taskToPause = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToPause || !taskToPause.inicioTarefa) return;

    const secondsPassed = Date.now() - taskToPause.inicioTarefa.toDate().getTime();
    const newDuration = taskToPause.duracaoSegundos + Math.round(secondsPassed / 1000);

    try {
      await updateDoc(taskDocRef, {
        subStatus: 'pausada',
        duracaoSegundos: newDuration,
        inicioTarefa: null,
      });
    } catch (error) {
      console.error("Erro ao pausar tarefa:", error);
    }
  };

  const handleResumeTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        subStatus: 'rodando',
        inicioTarefa: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao continuar tarefa:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    const taskToComplete = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToComplete) return;

    let finalDuration = taskToComplete.duracaoSegundos; // se a tarefa estiver subStatus 'pausada' nao precisa de fazer calculo

    if (taskToComplete.status === 'em andamento' && taskToComplete.inicioTarefa) {
        const secondsPassed = Date.now() - taskToComplete.inicioTarefa.toDate().getTime();
        finalDuration += Math.round(secondsPassed / 1000);  
    }

    try {
      await updateDoc(taskDocRef, {
        status: 'concluida',
        subStatus: null,
        fimTarefa: serverTimestamp(),
        duracaoSegundos: finalDuration,
        inicioTarefa: null,
      });
    } catch (error) {
      console.error('Erro ao concluir a tarefa:', error);
    }
  };

  const isAnyTaskActive = tasks.some((task) => task.status === 'em andamento');

  const value = {
    tasks,
    isAnyTaskActive,
    handleStartTask,
    handlePauseTask,
    handleResumeTask,
    handleCompleteTask,
  };

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}