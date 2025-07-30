'use client';

import React from 'react';
import { TaskCard } from '@/components/features/TaskCard';
import { useRoutine } from '@/contexts/RoutineContext';
import { AddTask } from './AddTask';

export function TaskList() {
  const {
    tasks,
    isAnyTaskActive,
    handleStartTask,
    handlePauseTask,
    handleResumeTask,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTaskName,
  } = useRoutine();

  return (
    <div className="flex flex-col gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.tarefaId}
          task={task}
          onStartClick={() => handleStartTask(task.tarefaId)}
          onPauseClick={() => handlePauseTask(task.tarefaId)}
          onResumeClick={() => handleResumeTask(task.tarefaId)}
          onCompleteClick={() => handleCompleteTask(task.tarefaId)}
          onDeleteClick={() => handleDeleteTask(task.tarefaId)}
          onUpdateTaskName={handleUpdateTaskName}
          isStartDisabled={isAnyTaskActive && task.status === 'pendente'}
        />
      ))}
      <AddTask/>
    </div>
  );
}