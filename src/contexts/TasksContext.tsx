'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tarefa } from '@/types';
import { db } from '@/lib/firebase/config';
import { useAuth } from './AuthContext';
import { useRoutines } from './RoutinesContext'; // 1. Depende do RoutinesContext
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
  increment,
  deleteField,
} from 'firebase/firestore';

interface TasksContextType {
  tasks: Tarefa[];
  isAnyTaskRunning: boolean;
  handleStartTask: (taskId: string) => void;
  handlePauseTask: (taskId: string) => void;
  handleResumeTask: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => void;
  handleReopenTask: (taskId: string) => void;
  handleAddTask: (taskName: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleUpdateTaskName: (taskId: string, newName: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const { user } = useAuth();
  const { activeRoutine } = useRoutines(); // 2. Pega a rotina ativa
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  
  useEffect(() => {
    if (activeRoutine && user) {
      const tasksQuery = query(
        collection(db, 'tasks'), 
        where('rotinaId', '==', activeRoutine.rotinaId),
        where('usuarioId', '==', user.uid)
      );

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          tarefaId: doc.id,
          ...(doc.data() as Omit<Tarefa, 'tarefaId'>),
        }));

        // AQUI ESTÁ A NOVA LÓGICA DE ORDENAÇÃO
        const sortedTasks = tasksData.sort((a, b) => {
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

        setTasks(sortedTasks);
      });

      return () => unsubscribeTasks();
    } else {
      setTasks([]); // Limpa as tarefas se não houver rotina ativa
    }
  }, [activeRoutine, user]);

  const isAnyTaskRunning = tasks.some(t => t.subStatus === 'rodando');

  const handleAddTask = async (taskName: string) => {
    if (!taskName.trim() || !activeRoutine || !user) return;

    const newTask: Omit<Tarefa, 'tarefaId'> = {
      rotinaId: activeRoutine.rotinaId,
      usuarioId: user.uid,
      nome: taskName.trim(),
      dataCriacao: Timestamp.now(),
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
    if (isAnyTaskRunning) return;

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
    const taskToResume = tasks.find((task) => task.tarefaId === taskId);

    if (!taskToResume || taskToResume.subStatus !== 'pausada') return;

    try {
      await updateDoc(taskDocRef, {
        status:'em andamento',
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

    if (!taskToComplete)  return;

    let finalDuration = taskToComplete.duracaoSegundos; // se a tarefa estiver subStatus 'pausada' nao precisa de fazer calculo

    if (taskToComplete.status === 'em andamento' && taskToComplete.inicioTarefa) {
      const secondsPassed = Date.now() - taskToComplete.inicioTarefa.toDate().getTime();
      finalDuration += Math.round(secondsPassed / 1000);
    }

    try {
      await updateDoc(taskDocRef, {
        status: 'concluida',
        subStatus: null,
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

    const handleReopenTask = async (taskId: string) => {
    if (!activeRoutine) return;

    const taskDocRef = doc(db, 'tasks', taskId);
    const routineDocRef = doc(db, 'routines', activeRoutine.rotinaId);

    try {
      // Atualiza a tarefa
      await updateDoc(taskDocRef, {
        status: 'em andamento',
        subStatus: 'rodando',
        inicioTarefa: serverTimestamp(),
        fimTarefa: deleteField(),
      });
      await updateDoc(routineDocRef, {
        tarefasConcluidas: increment(-1),
      });
    } catch (error) {
      console.error('Erro ao reabrir a tarefa:', error);
    }
  };



  const value = {
    tasks,
    activeRoutine,
    isAnyTaskRunning,
    handleStartTask,
    handlePauseTask,
    handleResumeTask,
    handleCompleteTask,
    handleAddTask,
    handleDeleteTask,
    handleUpdateTaskName,
    handleReopenTask,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks deve ser usado dentro de um TasksProvider');
  }
  return context;
}