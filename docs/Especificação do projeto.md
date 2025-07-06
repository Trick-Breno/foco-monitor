### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade |
|------|-----------------------------------------|----|
|RF-01| O sistema deve permitir criar, editar ou excluir tarefas | ALTA |
|RF-02| O sistema deve permitir iniciar, pausar,concluir uma tarefa e exibir tempo gasto na tarefa em tempo real. | ALTA |
|RF-03| O sistema deve permitir criar,iniciar,encerrar uma rotina e exibir em tempo real e duração da rotina | ALTA |
|RF-04| O sistema deve exibir informações de progresso da rotina. Porcentagem de tarefas concluídas, taxa de aproveitamento da rotina, porcentagem de tempo perdido e tempo de conclusão de cada tarefa. | ALTA |
|RF-05| O sistema deve permitir excluir todos os dados. | MÉDIA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
| RNF-01 | O sistema deve ter os dados sincronizados e funcionar em qualquer disositivo atravéz do navegador. | ALTA | 


### Regras de negócio

|ID     | Descrição da Regra de Negócio  |Prioridade |
|-------|-------------------------|----|
| RN-01 | Nenhuma outra tarefa pode ser iniciada enquanto uma estiver em execução. | ALTA | 
| RN-02 | Tarefas não podem ser iniciadas antes do início da rotina. | ALTA | 
| RN-03 | A rotina não pode ser encerrada com alguma tarefa em andamento. | ALTA |
| RN-04 | Ao encerrar uma rotina, a central de tarefas deve ser reiniciada. | ALTA | 


### Diagrama de classes

![Diagrama foco-monitor drawio (1jk)](https://github.com/user-attachments/assets/a0db20ef-2349-41c5-9734-9c3166fcdc01)
