'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Botao } from '@/components/ui/Botao';
import { Tarefa } from '@/types';
import { Timestamp } from 'firebase/firestore';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
};

interface TaskCardProps {
  task: Tarefa;
  onStartClick: () => void;
  onPauseClick?: () => void;
  onResumeClick?: () => void;
  onCompleteClick?: () => void;
  onDeleteClick: () => void;
  isStartDisabled?: boolean;
}

export function TaskCard({
  task,
  onStartClick,
  onPauseClick,
  onResumeClick,
  onCompleteClick,
  onDeleteClick,
  isStartDisabled = false,
}: TaskCardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(task.duracaoSegundos);

  useEffect(() => {
    if (task.status === 'em andamento' && task.subStatus === 'rodando' && task.inicioTarefa) {
      const intervalId = setInterval(() => {
        const now = Date.now();
        const startTime = task.inicioTarefa!.toDate().getTime();
        const secondsPassed = Math.round((now - startTime) / 1000);
        setElapsedSeconds(task.duracaoSegundos + secondsPassed);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setElapsedSeconds(task.duracaoSegundos);
    }
  }, [task.status, task.subStatus, task.inicioTarefa, task.duracaoSegundos]);


  if (task.status === 'em andamento') {
    return (
      <Card className="inline ring-2 ring-blue-500 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">{task.nome}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">
            {formatTime(elapsedSeconds)}
          </span>
          <div className="flex gap-2">
            {task.subStatus === 'rodando' ? (
              <Botao variant="secondary" onClick={onPauseClick}>
                Pausar
              </Botao>
            ) : (
              <Botao variant="secondary" onClick={onResumeClick}>
                Continuar
              </Botao>
            )}
            <Botao onClick={onCompleteClick}>Concluir</Botao>
          </div>
        </div>
      </Card>
    );
  }

  /*if (task.status === 'concluida') {
    return (
        <Card className="bg-gray-700 opacity-60 flex justify-between items-center">
            <span className="font-semibold line-through">{task.nome}</span>
            <span className="text-sm">{formatTime(task.duracaoSegundos)}</span>
        </Card>
    );
  }*/

    if (task.status === 'concluida') {
    return;
    
  }

  return (
    <Card >
      <span className="font-semibold">{task.nome}</span>
      <div className='flex items-center gap-2'>
        <Botao onClick={onStartClick} disabled={isStartDisabled}>
          Iniciar
        </Botao>
        <Botao onClick={onDeleteClick} variant='secondary' className='px-2 py-1 text-xs'>
          X
        </Botao>
      </div>
    </Card>
  );
}