'use client';

import React, { useEffect, useState } from "react";
import { useRoutine } from "@/contexts/RoutineContext";
import { Botao } from "../ui/Botao";
import { Card } from "../ui/Card";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/utils/formatTime";
import { Timestamp } from "firebase/firestore/lite";

export function RoutineController() {
    const {activeRoutine, handleCreateRoutine, handleStartRoutine, handleCompleteRoutine} = useRoutine();

    const routineSeconds = useTimer({
        isRunning: activeRoutine?.status === 'em andamento',
        startTime: activeRoutine?.inicioRotina,
        savedDuration: activeRoutine?.duracaoSegundos || 0,
    })

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
                    <span className="text-2xl font-bold mr-4">{formatTime(routineSeconds)}</span>
                )}
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