'use client';

import React from 'react';
import { TaskCard } from '@/components/features/TaskCard';
import { useRoutines } from '@/contexts/RoutinesContext';
import { useTasks } from '@/contexts/TasksContext';
import { AddTask } from './AddTask';

export function TaskList() {
  const { activeRoutine } = useRoutines();
  const {
    tasks,
    isAnyTaskRunning,
    handleStartTask,
    handlePauseTask,
    handleResumeTask,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTaskName,
  } = useTasks();

  if (!activeRoutine) {
    return null;
  }

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
          isStartDisabled={
            isAnyTaskRunning  ||activeRoutine.status === 'criada'}
        />
      ))}
      <AddTask/>
    </div>
  );
}