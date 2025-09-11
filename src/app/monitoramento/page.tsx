'use client';

import React, { useState, useEffect } from 'react';
import { useRoutine } from '@/contexts/RoutineContext';
import { useAuth } from '@/contexts/AuthContext';
import { Rotina, Tarefa } from '@/types';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatTime } from '@/utils/formatTime';
import { Botao } from '@/components/ui/Botao';

export default function MonitoramentoPage() {
  // 1. Pegar os valores "vivos" do contexto
  const { activeRoutine, handleReopenTask, liveRoutineSeconds, liveTaskSeconds, tasks: contextTasks } = useRoutine();
  const { user } = useAuth();

  const [displayRoutine, setDisplayRoutine] = useState<Rotina | null>(null);
  const [displayTasks, setDisplayTasks] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      if (activeRoutine) {
        setDisplayRoutine(activeRoutine);
      } else if (user) {
        const routinesQuery = query(
          collection(db, 'routines'),
          where('status', '==', 'concluida'),
          where('usuarioId', '==', user.uid),
          orderBy('fimRotina', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(routinesQuery);
        if (!querySnapshot.empty) {
          const lastRoutine = {
            rotinaId: querySnapshot.docs[0].id,
            ...(querySnapshot.docs[0].data() as Omit<Rotina, 'rotinaId'>),
          };
          setDisplayRoutine(lastRoutine);
        } else {
          setDisplayRoutine(null);
        }
      }
      setIsLoading(false);
    };

    fetchRoutineData();
  }, [activeRoutine, user]);

  useEffect(() => {
    // A lógica para buscar as tarefas associadas não muda
    if (displayRoutine) {
      if (activeRoutine && activeRoutine.rotinaId === displayRoutine.rotinaId) {
        // Se a rotina em exibição é a ativa, usa as tarefas do contexto (em tempo real)
        setDisplayTasks(contextTasks);
      } else {
        const fetchTasks = async () => {
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('rotinaId', '==', displayRoutine.rotinaId)
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasksData = tasksSnapshot.docs.map((doc) => ({
            tarefaId: doc.id,
            ...(doc.data() as Omit<Tarefa, 'tarefaId'>),
          }));
          setDisplayTasks(tasksData);
        };
        fetchTasks();
      }
    }
  }, [displayRoutine, activeRoutine, contextTasks]);

  if (isLoading) {
    return <div className="text-center p-8">Carregando dados...</div>;
  }

  if (!displayRoutine) {
    return <div className="text-center p-8">Nenhuma rotina para exibir.</div>;
  }

  // --- LÓGICA DE CÁLCULO ATUALIZADA ---
  const isLive = !!activeRoutine; // É true se houver uma rotina ativa, senão false

  const routineDurationForCalc = isLive ? liveRoutineSeconds : displayRoutine.duracaoSegundos;

  const totalTaskDuration = displayTasks.reduce((sum, task) => {
    // Encontra a tarefa que está rodando
    const runningTask = displayTasks.find(t => t.subStatus === 'rodando');

    // Se a tarefa atual (do loop) for a que está rodando, usa o tempo vivo dela.
    if (isLive && runningTask && task.tarefaId === runningTask.tarefaId) {
      return sum + liveTaskSeconds;
    }
    
    // Senão, usa o tempo já salvo (para tarefas pausadas, concluídas ou pendentes)
    return sum + task.duracaoSegundos;
  }, 0);

  const aproveitamentoPercent = routineDurationForCalc > 0
    ? (totalTaskDuration / routineDurationForCalc) * 100
    : 0;

  // ... (outros cálculos agora usam as durações dinâmicas)
  const conclusaoPercent = displayRoutine.totalTarefas > 0
    ? (displayRoutine.tarefasConcluidas / displayRoutine.totalTarefas) * 100
    : 0;
  
  const tempoPerdidoTotal = routineDurationForCalc - totalTaskDuration;

  const percentPerdidoTotal = routineDurationForCalc > 0
    ? (tempoPerdidoTotal / routineDurationForCalc) * 100
    : 0;

  const completedTasks = displayTasks.filter((task) => task.status === 'concluida');

  return (
    // ... (O JSX para exibir os dados não muda, ele apenas recebe os novos valores calculados)
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Monitoramento de Desempenho</h1>
      
      <Card className='flex flex-col'>
        <h2 className="text-lg  text-center font-semibold mb-3">Aproveitamento</h2>
        <ProgressBar progress={aproveitamentoPercent} />
        <div className="flex  justify-between text-sm mt-2 text-gray-300">
          <span>Rotina: {formatTime(routineDurationForCalc)}</span>
          <span>Tarefas: {formatTime(totalTaskDuration)}</span>
        </div>
      </Card>

      <Card className='flex-col'>
        <h2 className="text-lg  text-center font-semibold mb-3">Conclusão de Tarefas</h2>
        <ProgressBar progress={conclusaoPercent} />
        <div className="flex  justify-between text-sm mt-2 text-gray-300">
          <span>Total de Tarefas: {displayRoutine.totalTarefas}</span>
          <span>Tarefas Concluídas: {displayRoutine.tarefasConcluidas}</span>
        </div>
      </Card>

      <Card className='flex-col'>
        <h2 className="text-lg  text-center font-semibold mb-3">Tempo Perdido Detalhes</h2>
        <ProgressBar progress={percentPerdidoTotal} label={`${Math.round(percentPerdidoTotal)}%`} />
        <div className="flex justify-between text-sm mt-2 text-gray-300 ">
          <span>Total Perdido: {formatTime(tempoPerdidoTotal)}</span>
        </div>
      </Card>
      <Card className="flex flex-col">
          {completedTasks.map((task) => {
    // CALCULE A PORCENTAGEM AQUI DENTRO, PARA CADA TAREFA
    const taskPercent = routineDurationForCalc > 0 
      ? (task.duracaoSegundos / routineDurationForCalc) * 100 
      : 0;

    return (
      <li
        key={task.tarefaId}
        className="flex gap-2 items-center text-gray-300 text-sm"
      >
        <div className='w-full'><span>{task.nome}</span></div>
        <span className=" font-mono bg-gray-700 px-2 py-1 rounded">
          {formatTime(task.duracaoSegundos)}
        </span>
        {/* USE A PORCENTAGEM CALCULADA AQUI */}
        <div className="flex w-full gap-2 bg-gray-700 rounded-full h-6 relative overflow-hidden" >
          <div className="bg-violet-800  h-6 rounded-full text-center text-white text-xs font-semibold flex items-center justify-end pr-2 transition-all duration-500" style={{ width:`${Math.round(taskPercent)}%`}}> </div> 
          {`${Math.round(taskPercent)}%`}
        </div>
                {displayRoutine.status !== 'concluida' && (
                  <Botao
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                    onClick={() => handleReopenTask(task.tarefaId)}
                  >
                    Continuar
                  </Botao>
                )}
                
      </li>
    );
  })}
  {completedTasks.length === 0 && (
    <p className="text-gray-500 text-sm">Nenhuma tarefa foi concluída.</p>
  )}
      </Card>
    </div>
  );
}