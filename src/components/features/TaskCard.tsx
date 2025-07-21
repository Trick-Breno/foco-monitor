'use client';

import React, {useState, useEffect} from 'react';
import { Card } from '@/components/ui/Card';
import {Botao} from '@/components/ui/Botao';
import {Tarefa} from '@/types';
import { Timestamp } from 'firebase/firestore';

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface TaskCardProps {
    task: Tarefa;
    onStartClick: () => void;
    onPauseClick?: () => void;
    onResumeClick?: () => void;
    onCompleteClick: () => void;
    isStartDisabled?: boolean;
};

export function TaskCard({
    task, 
    onStartClick,
    onPauseClick,
    onResumeClick,
    onCompleteClick,
    isStartDisabled = false
    }: TaskCardProps) {

    const [elapsedSeconds, setElapsedSeconds] = useState(task.duracaoSegundos);

    useEffect(() => {
        if (task.status !== 'em andamento' || task.subStatus !== 'rodando') {
            return;
        }

        const startTime = (task.inicioTarefa as Timestamp)?.toDate().getTime() || Date.now();
        

        const intervalId = setInterval(() => {
            setElapsedSeconds((prevSeconds) => prevSeconds + 1);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [task.status, task.subStatus, task.inicioTarefa, task.duracaoSegundos]);


    if (task.status === 'em andamento') {
        return (
        <Card className='ring-2 ring-blue-500 '>
            <div className="flex justify-between items-center mb-4">
                <span className='font-semibold text-lg'> {task.nome}</span>
            </div>
            <div className="flex justify-betwenn items-center gap-2">
                <span className="text-2xl font-bold">
                    {formatTime(elapsedSeconds)}
                </span>
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
                    
                    <Botao onClick={onCompleteClick}>
                        Concluir
                    </Botao>
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