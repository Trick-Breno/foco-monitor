'use client';

import React, { useState, useEffect } from 'react';
import { useRoutine } from '@/contexts/RoutineContext';
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

export default function MonitoramentoPage() {
  // 1. Pegar os valores "vivos" do contexto
  const { activeRoutine, liveRoutineSeconds, liveTaskSeconds } = useRoutine();

  const [displayRoutine, setDisplayRoutine] = useState<Rotina | null>(null);
  const [displayTasks, setDisplayTasks] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      if (activeRoutine) {
        setDisplayRoutine(activeRoutine);
      } else {
        const routinesQuery = query(
          collection(db, 'routines'),
          where('status', '==', 'concluida'),
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
  }, [activeRoutine]);

  useEffect(() => {
    // A lógica para buscar as tarefas associadas não muda
    if (displayRoutine) {
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
  }, [displayRoutine]);

  if (isLoading) {
    return <div className="text-center p-8">Carregando dados...</div>;
  }

  if (!displayRoutine) {
    return <div className="text-center p-8">Nenhuma rotina para exibir.</div>;
  }

  // --- LÓGICA DE CÁLCULO ATUALIZADA ---
  const isLive = !!activeRoutine; // É true se houver uma rotina ativa, senão false

  // 2. Usar o tempo vivo se a rotina estiver ativa, senão o tempo salvo
  const routineDurationForCalc = isLive
    ? liveRoutineSeconds
    : displayRoutine.duracaoSegundos;

  const totalTaskDuration = displayTasks.reduce((sum, task) => {
    // Se a tarefa atual é a que está rodando, usa seu tempo vivo
    if (isLive && task.status === 'em andamento' && task.subStatus === 'rodando') {
      return sum + liveTaskSeconds;
    }
    // Senão, usa o tempo já salvo (para tarefas pausadas ou concluídas)
    return sum + task.duracaoSegundos;
  }, 0);

  const totalPauseDuration = displayTasks.reduce((sum, task) => sum + task.duracaoPausas, 0);

  const aproveitamentoPercent = routineDurationForCalc > 0
    ? (totalTaskDuration / routineDurationForCalc) * 100
    : 0;

  // ... (outros cálculos agora usam as durações dinâmicas)
  const conclusaoPercent = displayRoutine.totalTarefas > 0
    ? (displayRoutine.tarefasConcluidas / displayRoutine.totalTarefas) * 100
    : 0;
  
  const tempoPerdidoTotal = routineDurationForCalc - totalTaskDuration;
  const tempoPerdidoSemTarefas = tempoPerdidoTotal - totalPauseDuration;

  const percentPerdidoTotal = routineDurationForCalc > 0
    ? (tempoPerdidoTotal / routineDurationForCalc) * 100
    : 0;

  const percentPerdidoSemTarefas = tempoPerdidoTotal > 0 && tempoPerdidoTotal > 0
    ? (tempoPerdidoSemTarefas / tempoPerdidoTotal) * 100
    : 0;

  const percentPerdidoDuranteTarefas = tempoPerdidoTotal > 0 && tempoPerdidoTotal > 0
    ? (totalPauseDuration / tempoPerdidoTotal) * 100
    : 0;

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
        <div className="space-y-4">
          <div className='flex'>
            <div className="flex justify-between text-sm mb-1 text-gray-300">
              <span>Sem Tarefas: {formatTime(tempoPerdidoSemTarefas)}</span>
            </div>
            <ProgressBar progress={percentPerdidoSemTarefas} label={`${Math.round(percentPerdidoSemTarefas)}%`} />
          </div>
          <div className='flex'>
            <div className="flex justify-between text-sm mb-1 text-gray-300">
              <span>Pausas: {formatTime(totalPauseDuration)}</span>
            </div>
            <ProgressBar progress={percentPerdidoDuranteTarefas} label={`${Math.round(percentPerdidoDuranteTarefas)}%`} />
          </div>
          <div className='flex'>
            <div className="flex justify-between text-sm mb-1 text-gray-300 ">
              <span>Total Perdido: {formatTime(tempoPerdidoTotal)}</span>
            </div>
            <ProgressBar progress={percentPerdidoTotal} label={`${Math.round(percentPerdidoTotal)}%`} />
          </div>
        </div>
      </Card>
    </div>
  );
}