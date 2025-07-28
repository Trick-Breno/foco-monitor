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
    status: StatusTarefa;
    subStatus?: SubStatusTarefa;
    inicioTarefa?: Timestamp;
    fimTarefa?: Timestamp;
    duracaoSegundos: number;
    duracaoPausas: number;
    //pausas: Array<{ inicio: Timestamp; fim: Timestamp}>;
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