'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Botao } from '@/components/ui/Botao';
import { Tarefa } from '@/types';
import { useTimer } from '@/hooks/useTimer';
import { formatTime } from '@/utils/formatTime';
import { Timestamp } from 'firebase/firestore';

interface TaskCardProps {
  task: Tarefa;
  onStartClick: () => void;
  onPauseClick?: () => void;
  onResumeClick?: () => void;
  onCompleteClick?: () => void;
  onDeleteClick?: () => void;
  onUpdateTaskName?: (taskId: string, newName: string) => void;
  isStartDisabled?: boolean;
}

export function TaskCard({
  task,
  onStartClick,
  onPauseClick,
  onResumeClick,
  onCompleteClick,
  onDeleteClick,
  onUpdateTaskName,
  isStartDisabled = false,
}: TaskCardProps) {

  const elapsedSeconds = useTimer({
    isRunning: task.status === 'em andamento' && task.subStatus === 'rodando',
    startTime: task.inicioTarefa,
    savedDuration: task.duracaoSegundos,
  }); 

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.nome);

  const handleSave = () => {
    if (onUpdateTaskName && editedName.trim() !== task.nome) {
      onUpdateTaskName(task.tarefaId, editedName);
    }
    setIsEditing(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'enter') {
      handleSave();
    }
  };

  const taskNameComponent = isEditing ? (
    <input 
    type="text" 
    value={editedName}
    onChange={(e) => setEditedName(e.target.value)}
    onBlur={handleSave}
    onKeyDown={handleKeyDown}
    className='bg-gray-700 text-white px-2 py-1 rounded-md focus:outline-none focus:ring-blue-500 w-full'
    autoFocus
    />
  ) : (
    <span
      onClick={() => setIsEditing(true)}
      className='font-semibold cursor-pointer hover:text-gray-300'
    >
      {task.nome}
    </span>
  );

  if (task.status === 'em andamento') {
    return (
      <Card className="inline ring-2 ring-blue-500 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          {taskNameComponent}
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

  if (task.status === 'concluida') {
    return (
        <Card className="bg-gray-700 opacity-60 flex justify-between items-center">
          <span className="font-semibold line-through">{task.nome}</span>
          <span className="text-sm">{formatTime(task.duracaoSegundos)}</span>
          <Botao onClick={onDeleteClick} variant='secondary' className='px-2 py-1 text-xs'> X </Botao>
        </Card>
    );
  }

 

  return (
    <Card >
      <div className="flex-grow">
        {taskNameComponent}
      </div>
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