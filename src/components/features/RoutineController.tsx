'use client';

import React from "react";
import { useRoutine } from "@/contexts/RoutineContext";
import { Botao } from "../ui/Botao";
import { Card } from "../ui/Card";

export function RoutineController() {
    const {activeRoutine, handleCreateRoutine, handleStartRoutine, handleCompleteRoutine} = useRoutine();

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
        <Card className="mb-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col hidden">
                    <span className="text-sm text-gray-400 ">Rotina do Dia</span>
                    <span className="text-xl font-bold text-blue-400">{activeRoutine.status}</span>
                </div>
                {activeRoutine.status === 'criada' && (
                    <Botao onClick={() => handleStartRoutine(activeRoutine.rotinaId)} className="px-6 py-3">
                        Iniciar Rotina
                    </Botao>
                )}
                {activeRoutine.status === 'em andamento' && (
                    <Botao onClick={() => handleCompleteRoutine(activeRoutine.rotinaId)} variant="secondary">
                        Encerrar Rotina
                    </Botao>
                )}
            </div>
        </Card>
    );
}