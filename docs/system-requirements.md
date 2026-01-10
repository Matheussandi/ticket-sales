# Requisitos do Sistema

## Visão Geral

O sistema será uma **API REST** projetada para permitir a criação, gerenciamento e venda de ingressos para eventos por meio de parceiros. Ele será escalável para lidar com milhares de acessos simultâneos.

---

## Regras de Negócio

### 1. Gerenciamento de Tickets

- **Apenas o parceiro criador do evento pode gerenciar os tickets associados.**
- **Tickets são criados em lote e começam com o status "disponível".**

### 2. Compra de Tickets

- **Um cliente pode comprar vários tickets de diferentes eventos em uma única compra.**
- **Somente um cliente pode comprar um ticket específico por vez (controle de concorrência).**
- **Se a compra falhar, os dados devem ser registrados com o motivo da falha.**

### 3. Cancelamento de Compras

- **Um cliente pode cancelar a compra, liberando os tickets para venda novamente.**
- **O histórico de alterações de status deve ser mantido.**

### 4. Escalabilidade

- **O sistema deve suportar altas cargas de acesso simultâneo.**

### 5. Parceiros

- **Parceiros serão registrados no sistema e terão acesso a um painel de controle.**
- **Parceiros podem criar eventos e gerenciar os tickets associados.**
- **Parceiros podem visualizar as vendas de tickets associadas aos seus eventos.**

### 6. Clientes

- **Clientes serão registrados no sistema e poderão comprar tickets para eventos.**
- **Clientes podem visualizar os eventos disponíveis e comprar tickets.**
- **Clientes podem cancelar suas compras e visualizar o histórico de compras.**

---

## Requisitos Funcionais

### RF01 - Cadastro de Parceiros
- O sistema deve permitir o registro de parceiros no sistema.
- O sistema deve fornecer um painel de controle para parceiros gerenciarem seus eventos e tickets.
- O sistema deve autenticar e autorizar o acesso dos parceiros ao painel.

### RF02 - Gerenciamento de Eventos
- O sistema deve permitir que parceiros criem eventos com informações como nome, data, local e descrição.
- O sistema deve permitir que parceiros editem ou excluam eventos criados por eles.

### RF03 - Gerenciamento de Tickets
- O sistema deve permitir a criação de tickets em lote para um evento específico.
- Todos os tickets criados devem iniciar com o status "disponível".
- Apenas o parceiro criador do evento pode gerenciar (criar, editar, excluir) os tickets associados.
- Parceiros devem poder visualizar as vendas de tickets associadas aos seus eventos.

### RF04 - Cadastro de Clientes
- O sistema deve permitir o registro de clientes no sistema.
- O sistema deve autenticar e autorizar o acesso dos clientes às funcionalidades de compra.

### RF05 - Compra de Tickets
- O sistema deve permitir que clientes comprem múltiplos tickets de diferentes eventos em uma única transação.
- O sistema deve implementar controle de concorrência para garantir que apenas um cliente possa comprar um ticket específico por vez.
- O sistema deve registrar todas as tentativas de compra, incluindo falhas e seus respectivos motivos.
- Clientes devem poder visualizar os eventos disponíveis antes de realizar a compra.

### RF06 - Cancelamento de Compras
- O sistema deve permitir que clientes cancelem suas compras.
- Ao cancelar uma compra, os tickets devem ser liberados e voltar ao status "disponível".
- O sistema deve manter um histórico completo de todas as alterações de status dos tickets.

### RF07 - Consulta de Tickets e Histórico
- O sistema deve permitir que clientes consultem tickets disponíveis por evento.
- O sistema deve permitir que clientes consultem suas compras realizadas.
- O sistema deve permitir que clientes visualizem o histórico completo de suas compras.

---

## Requisitos Não Funcionais

### RNF01 - Escalabilidade
- O sistema deve ser capaz de lidar com milhares de acessos simultâneos sem degradação significativa de performance.

### RNF02 - Concorrência
- O sistema deve implementar mecanismos de controle de concorrência para evitar condições de corrida na compra de tickets.

### RNF03 - Auditoria
- O sistema deve manter registros de auditoria de todas as operações críticas (criação, compra, cancelamento de tickets).

### RNF04 - Disponibilidade
- O sistema deve ter alta disponibilidade, com tolerância a falhas.

### RNF05 - Performance
- O sistema deve responder às requisições em tempo adequado, mesmo sob alta carga.

---

## Fluxos Principais

### Fluxo 1: Criação de Evento e Tickets
1. Parceiro cria um evento no sistema
2. Parceiro cria lote de tickets para o evento
3. Sistema define status inicial "disponível" para todos os tickets
4. Tickets ficam disponíveis para compra

### Fluxo 2: Compra de Tickets
1. Cliente seleciona tickets de um ou mais eventos
2. Sistema verifica disponibilidade e aplica lock nos tickets selecionados
3. Sistema processa a compra
4. Em caso de sucesso: tickets marcados como "vendido" e associados ao cliente
5. Em caso de falha: tickets liberados e falha registrada com motivo

### Fluxo 3: Cancelamento de Compra
1. Cliente solicita cancelamento de compra
2. Sistema valida a propriedade da compra
3. Sistema libera os tickets associados (status "disponível")
4. Sistema registra alteração de status no histórico
5. Tickets ficam disponíveis para nova compra

---

## Estados dos Tickets

- **disponível**: Ticket criado e disponível para compra
- **reservado**: Ticket temporariamente bloqueado durante processo de compra
- **vendido**: Ticket comprado por um cliente
- **cancelado**: Ticket de uma compra cancelada (volta para disponível)

---

## Atores do Sistema

### Parceiro
- Registrado no sistema com acesso a painel de controle
- Cria e gerencia eventos
- Cria e gerencia tickets dos seus eventos
- Visualiza as vendas de tickets associadas aos seus eventos
- Visualiza relatórios de vendas

### Cliente
- Registrado no sistema para realizar compras
- Visualiza eventos disponíveis
- Consulta tickets disponíveis por evento
- Compra tickets para eventos
- Consulta suas compras realizadas
- Visualiza histórico completo de compras
- Cancela compras

---

## Considerações de Segurança

- Autenticação e autorização de parceiros e clientes
- Validação de propriedade de recursos (parceiro só gerencia seus eventos)
- Proteção contra ataques de concorrência e race conditions
- Registro de todas as operações para auditoria
