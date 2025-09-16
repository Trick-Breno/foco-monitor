'use client';

import React, {useState} from "react";
import { useTasks } from "@/contexts/TasksContext";
import { Botao } from "../ui/Botao";

export function AddTask() {
    const [newTaskName, setNewTaskName] = useState('');
    const {handleAddTask} = useTasks();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddTask(newTaskName);
        setNewTaskName(''); // Limpa o campo após o envio
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-gray-800 rounded-lg">
            <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Nome da nova tarefa"
                className="flex-grow text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            />
            <Botao type="submit">Adicionar</Botao>
        </form>
    );
}