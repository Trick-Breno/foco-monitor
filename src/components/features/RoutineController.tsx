'use client';

import React from 'react';
import { useRoutines } from '@/contexts/RoutinesContext'; 
import { useTimer } from '@/contexts/TimerContext';
import { Card } from '../ui/Card';
import { Botao } from '@/components/ui/Botao';
import { formatTime } from '@/utils/formatTime';
// Timer foi removido daqui, pois sua lógica será centralizada em outro lugar

export function RoutineController() {
  const { 
    activeRoutine,
    isLoading, // Usar o isLoading do novo contexto
    handleCreateRoutine,
    handleStartRoutine,
    handleCompleteRoutine 
  } = useRoutines(); // 2. Usar o novo hook

  const { liveRoutineSeconds } = useTimer(); // Pega o tempo do TimerContext


  if (isLoading) {
    return <div className="text-center p-4">Carregando rotina...</div>;
  }

  if (!activeRoutine) {
    return (
      <div className="flex justify-center items-center p-4">
        <Botao onClick={handleCreateRoutine} className="px-8 py-4 text-lg">
          Criar Nova Rotina
        </Botao>
      </div>
    );
  }

  return (
    <Card className=" mb-4 flex justify-center  ">
        <div className="flex justify-between items-center ">
            {activeRoutine && (
                <span className="text-xl font-bold mr-4 ">{formatTime(liveRoutineSeconds)}</span>
            )}
            {activeRoutine.status === 'criada' && (
                <Botao onClick={() => handleStartRoutine(activeRoutine.rotinaId)} className=" px-6 py-3">
                    Iniciar Rotina
                </Botao>
            )}
            {activeRoutine.status === 'em andamento' && (
                <Botao onClick={() => handleCompleteRoutine(activeRoutine.rotinaId)} className="text-sm" variant="secondary">
                    Encerrar Rotina
                </Botao>
            )}
        </div>
    </Card>
  );
}