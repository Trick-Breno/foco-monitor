'use client';

import React, {useState} from 'react';
import { TaskCard } from './TaskCard';
import { Tarefa, StatusTarefa, SubStatusTarefa } from '@/types';

const INITIAL_TASKS: Tarefa[] = [
    {
        tarefaId: '1',
        rotinaId: '1',
        usuarioId: '1',
        nome: 'Fazer almoço',
        status: 'pendente',
        duracaoSegundos: 0,
        duracaoPausas: 0,
        pausas: [],
    },
    {
        tarefaId: '2',
        rotinaId: '1',
        usuarioId: '1',
        nome: 'Fazer Caminhada',
        status: 'pendente',
        duracaoSegundos: 0,
        duracaoPausas: 0,
        pausas: [],
    },
    {
        tarefaId: '3',
        rotinaId: '1',
        usuarioId: '1',
        nome: 'Estudar',
        status: 'pendente',
        duracaoSegundos: 0,
        duracaoPausas: 0,
        pausas: [],
    },
];

export function TaskList() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);

    const handleStartTask = (taskId: string) => {
        const updatedTasks = tasks.map((task) => 
            task.tarefaId === taskId ? 
            { 
                ...task, 
                status:'em andamento' as StatusTarefa, 
                subStatus: 'rodando' as SubStatusTarefa
            }
            : task
        );

        const sortedTasks = updatedTasks.sort((a, b) => {
            if (a.status === 'em andamento') return -1;
            if (b.status === 'em andamento') return 1;
            return 0;
        })

      setTasks(sortedTasks);
    };

    const handlePauseTask = (taskId: string) => {
        setTasks(
            tasks.map((task) =>
            task.tarefaId === taskId ?
            {...task, subStatus: 'pausada' as SubStatusTarefa}
            : task
            )
        );
    };

    const handleResumeTask = (taskId: string) => {
        setTasks(
            tasks.map((task) =>
            task.tarefaId === taskId ?
            {...task, subStatus: 'rodando' as SubStatusTarefa}
            : task
            )
        );
    };

    const isAnyTaskActive = tasks.some((task) => task.status === 'em andamento');

    return (
        <div className='flex flex-col gap-4'>
            {tasks.map((task) => (
                <TaskCard
                    key={task.tarefaId}
                    task={task}
                    onStartClick={() => handleStartTask(task.tarefaId)}
                    onPauseClick={() => handlePauseTask(task.tarefaId)}
                    onResumeClick={() => handleResumeTask(task.tarefaId)}
                    isStartDisabled={isAnyTaskActive && task.status === 'pendente'}
                />
            ))}
        </div>
    );
}