'use client';

import React, {useState, useEffect} from 'react';
import { Card } from '@/components/ui/Card';
import {Botao} from '@/components/ui/Botao';
import {Tarefa} from '@/types';

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
}

interface TaskCardProps {
    task: Tarefa;
    onStartClick: () => void;
    onPauseClick?: () => void;
    onResumeClick?: () => void;
    isStartDisabled?: boolean;
};

export function TaskCard({
    task, 
    onStartClick,
    onPauseClick,
    onResumeClick,
    isStartDisabled = false
    }: TaskCardProps) {
    if (task.status === 'em andamento') {
        return (
        <Card className='ring-2 ring-blue-500 '>
            <div className="flex justify-between items-center mb-4">
                <span className='font-semibold text-lg'> {task.nome}</span>
            </div>
            <div className="flex justify-betwenn items-center gap-2">
                <span className="text-2xl font-bold">00:00:00</span>
                <div className="flex gap-2">
                    {task.subStatus === 'rodando' ?(
                        <Botao variant="secundary" onClick={onPauseClick}>
                            Pausar
                        </Botao>
                    ) : (
                        <Botao variant="secundary" onClick={onResumeClick}>
                            Continuar
                        </Botao>
                    )}
                    
                    <Botao>Concluir</Botao>
                </div>
            </div>
        </Card>
    );
    }
    return (
        <Card className='flex justify-between items-center'>
            <span className='font-semibold'> {task.nome}</span>
            <Botao onClick={onStartClick} disabled={isStartDisabled}> 
                Iniciar 
            </Botao>
        </Card>
    );
}