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
    inicioTarefa?: Date;
    fimTarefa?: Date;
    duracaoSegundos: number;
    duracaoPausas: number;
    pausas: Array<{ inicio: Date; fim: Date}>;
};

export interface Rotina {
    rotinaId: string;
    usuarioId: string;
    data: Date;
    status: StatusRotina;
    inicioRotina?: Date;
    fimRotina?: Date;
    duracaoSegundos: number;
    totalTarefas: number;
    tarefasConcluidas: number;
};