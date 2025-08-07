import { Timestamp } from "firebase/firestore";

export type StatusRotina = "criada" | "em andamento" | "concluida";
export type StatusTarefa = "pendente" | "em andamento" | "concluida";
export type SubStatusTarefa = "rodando" | "pausada";

export interface TemplateTarefa {
    templateId: string;
    usuarioId: string;
    nome: string;
};

export interface Tarefa {
    tarefaId: string;
    usuarioId: string;
    rotinaId: string;
    nome: string;
    dataCriacao: Timestamp;
    status: StatusTarefa;
    subStatus?: SubStatusTarefa;
    inicioTarefa?: Timestamp;
    fimTarefa?: Timestamp;
    duracaoSegundos: number;
    duracaoPausas: number;
    inicioRef?: Timestamp; // referencia para calcular a duração das pausas
};

export interface Rotina {
    rotinaId: string;
    usuarioId: string;
    data: Timestamp;
    status: StatusRotina;
    inicioRotina?: Timestamp;
    fimRotina?: Timestamp;
    duracaoSegundos: number;
    totalTarefas: number;
    tarefasConcluidas: number;
};