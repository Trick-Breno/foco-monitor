"use client"; // ESSENCIAL: Precisa ser um client component para usar o timer

import React, { useState, useEffect } from 'react'; // Importamos os hooks
import { Rotina, Tarefa } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';

// Verifique se o caminho para formatTime está correto
import { formatTime } from '@/utils/formatTime'; 

// Função para formatar a data da rotina
const formatDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('pt-BR');
};

interface WidgetDisplayProps {
  routine: Rotina;
  tasks: Tarefa[];
}

export const WidgetDisplay = ({ routine, tasks }: WidgetDisplayProps) => {
  // --- 1. ESTADO PARA O TEMPO AO VIVO ---
  const [liveRoutineTime, setLiveRoutineTime] = useState(routine.duracaoSegundos);
  const [liveTaskTime, setLiveTaskTime] = useState(0);

  // --- 2. LÓGICA DE TIMER (Copiada do seu TimerContext) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Lógica do cronômetro da Rotina
      if (routine?.status === 'em andamento' && routine.inicioRotina) {
        const now = Date.now();
        const startTime = routine.inicioRotina.toDate().getTime();
        setLiveRoutineTime(Math.round((now - startTime) / 1000));
      } else {
        setLiveRoutineTime(routine.duracaoSegundos || 0);
      }

      // Lógica do cronômetro da Tarefa
      const runningTask = tasks.find(
        (task) => task.status === 'em andamento' && task.subStatus === 'rodando'
      );

      if (runningTask && runningTask.inicioTarefa) {
        const now = Date.now();
        const startTime = runningTask.inicioTarefa.toDate().getTime();
        const secondsPassed = Math.round((now - startTime) / 1000);
        setLiveTaskTime(runningTask.duracaoSegundos + secondsPassed);
      } else {
        // Se nenhuma tarefa está rodando, procuramos uma pausada para exibir seu tempo
        const pausedTask = tasks.find(
          (task) => task.status === 'em andamento' && task.subStatus === 'pausada'
        );
        if (pausedTask) {
          setLiveTaskTime(pausedTask.duracaoSegundos);
        } else {
          setLiveTaskTime(0); // Reseta se não houver tarefa ativa
        }
      }
    }, 1000); // Roda a cada segundo

    return () => clearInterval(intervalId); // Limpa o timer ao desmontar
  }, [routine, tasks]); // Recalcula se a rotina ou as tarefas mudarem

  // --- 3. Lógica da Barra de Progresso ---
  const tasksConcluidas = tasks.filter(t => t.status === 'concluida').length;
  const totalTasks = tasks.length;
  const progresso = totalTasks > 0 ? (tasksConcluidas / totalTasks) * 100 : 0;
  
  // --- 4. Componente Visual do RoutineController ---
  const WidgetRoutineController = () => (
    <Card className="mb-4 flex justify-center">
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold mr-4">
          {/* AGORA USA O TEMPO AO VIVO! */}
          {formatTime(liveRoutineTime)}
        </span>
        <span className="text-sm text-gray-400">
          Rotina de {formatDate(routine.data)}
        </span>
      </div>
    </Card>
  );

  // --- 5. Componente Visual do TaskCard ---
  const WidgetTaskCard = ({ task }: { task: Tarefa }) => {
    // TAREFA EM ANDAMENTO (rodando ou pausada)
    if (task.status === 'em andamento') {
      const isRunning = task.subStatus === 'rodando';
      return (
        <Card className="inline ring-2 ring-violet-800 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">{task.nome}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {/* AGORA USA O TEMPO AO VIVO (se rodando) OU O TEMPO SALVO (se pausada) */}
              {isRunning ? formatTime(liveTaskTime) : formatTime(task.duracaoSegundos)}
            </span>
          </div>
        </Card>
      );
    }

    // TAREFA CONCLUÍDA
    if (task.status === 'concluida') {
      return (
        <Card className="bg-gray-700 opacity-60 flex justify-between items-center">
          <span className="font-semibold line-through">{task.nome}</span>
          <span className="text-sm">{formatTime(task.duracaoSegundos)}</span>
        </Card>
      );
    }

    // TAREFA PENDENTE
    return (
      <Card>
        <div className="flex flex-grow items-center">
          <span className="font-semibold">{task.nome}</span>
        </div>
      </Card>
    );
  };

  // --- 6. Renderização Principal ---
  return (
    <div className="flex flex-col gap-4">
      <WidgetRoutineController />

      {tasks.map((task) => (
        <WidgetTaskCard key={task.tarefaId} task={task} />
      ))}

      {/* Barra de Progresso */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1 text-gray-300">
          <span>Progresso</span>
          <span>{tasksConcluidas} / {totalTasks}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full" 
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WidgetDisplay;