'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tarefa, Rotina, StatusTarefa, SubStatusTarefa, StatusRotina } from '@/types';
import { db } from '@/lib/firebase/config';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  addDoc,
  deleteDoc,
  query,
  where,
  limit,
  increment,
} from 'firebase/firestore';

interface RoutineContextType {
  tasks: Tarefa[];
  activeRoutine: Rotina | null;
  isAnyTaskActive: boolean;
  handleCreateRoutine: () => void;
  handleStartRoutine: (routineId: string) => void;
  handleCompleteRoutine: (routineId: string) => void;
  handleStartTask: (taskId: string) => void;
  handlePauseTask: (taskId: string) => void;
  handleResumeTask: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => void;
  handleAddTask: (taskName: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleUpdateTaskName: (taskId: string, newName: string) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

interface RoutineProviderProps {
  children: ReactNode;
}

export function RoutineProvider({ children }: RoutineProviderProps) {
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Rotina | null>(null);

  useEffect(() => {
    const routinesQuery = query (
      collection(db, 'routines'),
      where('status', 'in', ['criada', 'em andamento']),
      limit(1)
    );

    const unsubscribeRoutines = onSnapshot(routinesQuery, (snapshot) => {
      if (snapshot.empty) {
        setActiveRoutine(null);
        setTasks([]);
      } else {
        const routineData = {
          rotinaId: snapshot.docs[0].id,
          ...(snapshot.docs[0].data() as Omit<Rotina, 'rotinaId'>),
        };
        setActiveRoutine(routineData);
      }
    });

    return () => unsubscribeRoutines();
  }, []);

  useEffect(() => {
    if (activeRoutine) {
      const tasksQuery = query(
        collection(db, 'tasks'), 
        where('rotinaId', '==', activeRoutine.rotinaId),
      );

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          tarefaId: doc.id,
          ...(doc.data() as Omit<Tarefa, 'tarefaId'>),
        }));
        setTasks(tasksData);
      });

      return () => unsubscribeTasks();
    }
    
  }, [activeRoutine]);

  const handleCreateRoutine = async () => {
    if (activeRoutine) {
      alert('Ja existe uma rotina. Conclua a rotina atual para criar uma nova.');
      return;
    }

    const newRoutine: Omit<Rotina, 'rotinaId'> = {
    usuarioId: '1',
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
        status: 'em andamento',
        inicioRotina: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao iniciar rotina:', error);
    }
  };

  const handleCompleteRoutine = async (routineId: string) => {
    if (isAnyTaskActive){
      alert('Antes de encerrar rotina, finalize a tarefa em andamento.');
      return;
    }

    const routineDocRef = doc(db, 'routines', routineId);
    const routineToComplete = activeRoutine;
    if (!routineToComplete || !routineToComplete.inicioRotina) return;

    const startTime = routineToComplete.inicioRotina.toDate().getTime();
    const endTime = Date.now();
    const durationInSeconds = Math.round((endTime - startTime) / 1000)

    try {
      await updateDoc(routineDocRef, {
        status: 'concluida',
        fimRotina: serverTimestamp(),
        duracaoSegundos: durationInSeconds,
      });
    } catch (error) {
      console.error('Erro ao concluir rotina:', error);
    }
  };

  const handleAddTask = async (taskName: string) => {
    if (!taskName.trim() || !activeRoutine) return;

    const newTask: Omit<Tarefa, 'tarefaId'> = {
      rotinaId: activeRoutine.rotinaId,
      usuarioId: '1',
      nome: taskName.trim(),
      data: Timestamp.now(),
      status: 'pendente',
      duracaoPausas: 0,
      duracaoSegundos: 0,
    };

    try {
      await addDoc(collection(db, 'tasks'), newTask);
      const routineDocRef = doc(db, 'routines', activeRoutine.rotinaId);
      await updateDoc(routineDocRef, {
        totalTarefas: increment(1),
      });
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const handleStartTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        status: 'em andamento',
        subStatus: 'rodando',
        inicioTarefa: serverTimestamp(),
        inicioRef: serverTimestamp(),
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
    const taskToResume = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToResume || !taskToResume.inicioRef) return;

    const secondsPassed = Date.now() - taskToResume.inicioRef.toDate().getTime();
    const pauseDuration = Math.round((secondsPassed) / 1000) - taskToResume.duracaoSegundos;


    try {
      await updateDoc(taskDocRef, {
        subStatus: 'rodando',
        duracaoPausas: pauseDuration,
        inicioTarefa: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao continuar tarefa:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    const taskToComplete = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToComplete || !taskToComplete.inicioRef )  return;

    let pauseDuration = taskToComplete.duracaoPausas ;
    
    if ( taskToComplete.subStatus === 'pausada') {
      const secondsPassed = Date.now() - taskToComplete.inicioRef.toDate().getTime();
      pauseDuration = Math.round((secondsPassed) / 1000) - taskToComplete.duracaoSegundos;
    }
    
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
        duracaoPausas: pauseDuration,
        duracaoSegundos: finalDuration,
        inicioTarefa: null,
      });

      if (activeRoutine) {
        const routineDocRef = doc(db, 'routines', activeRoutine.rotinaId);
        await updateDoc(routineDocRef, {
          tarefasConcluidas: increment(1),
        });
      }
    } catch (error) {
      console.error('Erro ao concluir a tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToDelete || !activeRoutine) return;

    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await deleteDoc(taskDocRef);
      const routineDocRef = doc(db, 'routines', activeRoutine.rotinaId);
      const updates = {
        totalTarefas: increment(-1),
        tarefasConcluidas: taskToDelete.status === 'concluida' ? increment(-1) : increment(0),
      };
      await updateDoc(routineDocRef, updates);

    } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    }
  };

  const handleUpdateTaskName = async (taskId: string, newName: string) => {
    if (!newName.trim()) return;
    const taskDocRef = doc(db, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        nome: newName.trim(),
      });
    } catch (error) {
      console.error('Erro ao atualizar o nome da tarefa:', error);
    }
  };

  const isAnyTaskActive = tasks.some((task) => task.status === 'em andamento');

  const value = {
    tasks,
    activeRoutine,
    isAnyTaskActive,
    handleCreateRoutine,
    handleStartRoutine,
    handleCompleteRoutine,
    handleStartTask,
    handlePauseTask,
    handleResumeTask,
    handleCompleteTask,
    handleAddTask,
    handleDeleteTask,
    handleUpdateTaskName,
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