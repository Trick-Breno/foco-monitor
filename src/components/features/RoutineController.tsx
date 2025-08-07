'use client';

import React from 'react';
import { useRoutine } from '@/contexts/RoutineContext';
import { Botao } from '@/components/ui/Botao';
import { Card } from '../ui/Card';
import { formatTime } from '@/utils/formatTime';

export function RoutineController() {
  const { 
    activeRoutine,
    liveRoutineSeconds, // Pega o tempo "vivo" do contexto
    handleCreateRoutine,
    handleStartRoutine,
    handleCompleteRoutine
  } = useRoutine();

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
                {activeRoutine && (
                    <span className="text-base font-bold mr-4">{formatTime(liveRoutineSeconds)}</span>
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