'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRoutines } from './RoutinesContext';
import { useTasks } from './TasksContext';

interface TimerContextType {
  liveRoutineSeconds: number;
  liveTaskSeconds: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const { activeRoutine } = useRoutines();
  const { tasks } = useTasks();

  const [liveRoutineSeconds, setLiveRoutineSeconds] = useState(0);
  const [liveTaskSeconds, setLiveTaskSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Lógica do cronômetro da Rotina
      if (activeRoutine?.status === 'em andamento' && activeRoutine.inicioRotina) {
        const now = Date.now();
        const startTime = activeRoutine.inicioRotina.toDate().getTime();
        setLiveRoutineSeconds(Math.round((now - startTime) / 1000));
      } else {
        setLiveRoutineSeconds(activeRoutine?.duracaoSegundos || 0);
      }

      // Lógica do cronômetro da Tarefa
      const runningTask = tasks.find(
        (task) => task.status === 'em andamento' && task.subStatus === 'rodando'
      );

      if (runningTask && runningTask.inicioTarefa) {
        const now = Date.now();
        const startTime = runningTask.inicioTarefa.toDate().getTime();
        const secondsPassed = Math.round((now - startTime) / 1000);
        setLiveTaskSeconds(runningTask.duracaoSegundos + secondsPassed);
      } else {
        const pausedTask = tasks.find(
          (task) => task.status === 'em andamento' && task.subStatus === 'pausada'
        );
        if (pausedTask) {
          setLiveTaskSeconds(pausedTask.duracaoSegundos);
        } else {
          setLiveTaskSeconds(0);
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [tasks, activeRoutine]);

  const value = {
    liveRoutineSeconds,
    liveTaskSeconds,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer deve ser usado dentro de um TimerProvider');
  }
  return context;
}