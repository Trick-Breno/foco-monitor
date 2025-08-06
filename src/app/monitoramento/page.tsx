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
  const { activeRoutine } = useRoutine();

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

  // --- LÓGICA DE CÁLCULO DAS ESTATÍSTICAS ---
  const totalTaskDuration = displayTasks.reduce((sum, task) => sum + task.duracaoSegundos, 0);
  const totalPauseDuration = displayTasks.reduce((sum, task) => sum + task.duracaoPausas, 0);

  const aproveitamentoPercent = displayRoutine.duracaoSegundos > 0
    ? (totalTaskDuration / displayRoutine.duracaoSegundos) * 100
    : 0;

  const conclusaoPercent = displayRoutine.totalTarefas > 0
    ? (displayRoutine.tarefasConcluidas / displayRoutine.totalTarefas) * 100
    : 0;
  
  const tempoPerdidoTotal = displayRoutine.duracaoSegundos - totalTaskDuration;
  const tempoPerdidoSemTarefas = tempoPerdidoTotal - totalPauseDuration;

  const percentPerdidoTotal = displayRoutine.duracaoSegundos > 0
    ? (tempoPerdidoTotal / displayRoutine.duracaoSegundos) * 100
    : 0;

  const percentPerdidoSemTarefas = tempoPerdidoTotal > 0
    ? (tempoPerdidoSemTarefas / tempoPerdidoTotal) * 100
    : 0;

  const percentPerdidoDuranteTarefas = tempoPerdidoTotal > 0
    ? (totalPauseDuration / tempoPerdidoTotal) * 100
    : 0;


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Monitoramento de Desempenho</h1>
      
      <Card>
        <h2 className="text-lg font-semibold mb-3">Aproveitamento</h2>
        <ProgressBar progress={aproveitamentoPercent} />
        <div className="flex justify-between text-sm mt-2 text-gray-300">
          <span>Rotina: {formatTime(displayRoutine.duracaoSegundos)}</span>
          <span>Tarefas: {formatTime(totalTaskDuration)}</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Conclusão de Tarefas</h2>
        <ProgressBar progress={conclusaoPercent} />
        <div className="flex justify-between text-sm mt-2 text-gray-300">
          <span>Total de Tarefas: {displayRoutine.totalTarefas}</span>
          <span>Tarefas Concluídas: {displayRoutine.tarefasConcluidas}</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Tempo Perdido Detalhes</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1 text-gray-300">
              <span>Sem Tarefas: {formatTime(tempoPerdidoSemTarefas)}</span>
            </div>
            <ProgressBar progress={percentPerdidoSemTarefas} label={`${Math.round(percentPerdidoSemTarefas)}%`} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1 text-gray-300">
              <span>Durante Tarefas: {formatTime(totalPauseDuration)}</span>
            </div>
            <ProgressBar progress={percentPerdidoDuranteTarefas} label={`${Math.round(percentPerdidoDuranteTarefas)}%`} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1 font-bold">
              <span>Total Perdido: {formatTime(tempoPerdidoTotal)}</span>
            </div>
            <ProgressBar progress={percentPerdidoTotal} label={`${Math.round(percentPerdidoTotal)}%`} />
          </div>
        </div>
      </Card>
    </div>
  );
}