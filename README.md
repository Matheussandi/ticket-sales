# 🎫 Sistema de Vendas de Ingressos

> **⚠️ Projeto em Desenvolvimento**
> 
> Este projeto está atualmente em fase de desenvolvimento ativo. Funcionalidades e APIs podem sofrer alterações.

## 📋 Sobre o Projeto

Sistema de vendas de ingressos para eventos, desenvolvido com Node.js, TypeScript, Express e MySQL. O sistema permite que parceiros criem e gerenciem eventos com tickets, enquanto clientes podem visualizar eventos e realizar compras.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar banco de dados com Docker
docker-compose up -d

# Executar em modo de desenvolvimento
npm run dev
```

## 📁 Estrutura do Projeto

```
vendas-ingresso/
├── src/
│   ├── app.ts              # Aplicação principal e configuração de rotas
│   ├── database.ts         # Configuração do pool de conexões MySQL
│   ├── controller/         # Controladores das rotas HTTP
│   ├── model/              # Modelos de dados (Active Record)
│   ├── services/           # Serviços com regras de negócio
│   └── types/              # Definições de tipos TypeScript
├── docs/                   # Documentação detalhada
│   ├── system-requirements.md  # Requisitos do sistema
│   ├── technologies.md     # Tecnologias utilizadas
│   ├── architecture.md     # Arquitetura do projeto
│   └── patterns.md         # Padrões de projeto
├── bru/                    # Coleção de requisições HTTP (Bruno)
├── docker-compose.yml      # Configuração do MySQL
├── init.sql                # Script de inicialização do banco
└── package.json            # Dependências e scripts
```

## 🔑 Endpoints da API

### Autenticação (`/auth`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/auth/login` | Login de usuário | Não |

### Parceiros (`/partners`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/partners` | Listar todos os parceiros | Sim |
| POST | `/partners/register` | Registro de novo parceiro | Não |
| POST | `/partners/events` | Criar evento | Sim |
| GET | `/partners/events` | Listar eventos do parceiro autenticado | Sim |
| GET | `/partners/events/:eventId` | Detalhes de um evento específico | Sim |

### Clientes (`/customers`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/customers/register` | Registro de novo cliente | Não |

### Eventos (`/events`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/events` | Listar todos os eventos | Não |
| GET | `/events/:eventId` | Detalhes de um evento | Não |
| POST | `/events` | Criar evento | Sim |

### Tickets (`/events/:eventId/tickets`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/events/:eventId/tickets` | Criar tickets em lote para um evento | Sim (Parceiro) |
| GET | `/events/:eventId/tickets` | Listar tickets de um evento | Não |
| GET | `/events/:eventId/tickets/:ticketId` | Detalhes de um ticket específico | Não |

### Compras (`/purchases`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/purchases` | Realizar compra de tickets | Sim (Cliente) |

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build do projeto
npm start            # Executar versão compilada
npm test             # Executar testes unitários
npm run test:watch   # Executar testes em modo watch
npm run test:coverage # Executar testes com cobertura de código
```

## 🧪 Testes

O projeto utiliza **Node.js Test Runner nativo** (built-in no Node.js 22+) para testes unitários.

### Executar Testes

```bash
# Executar todos os testes
npm test

# Watch mode (re-executa ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage
```

### Cobertura Atual

- ✅ **AuthService** - Login e autenticação
- ✅ **authMiddleware** - Autenticação e autorização de rotas
- 🔜 Services adicionais (Customer, Partner, Event, Ticket, Purchase)

Para mais detalhes sobre como escrever e executar testes, consulte [Guia de Testes](docs/testing.md).

## 📝 Convenções

- **Autenticação**: JWT no header `Authorization: Bearer <token>`
- **Senhas**: Criptografadas com bcrypt (10 rounds)
- **Timestamps**: Armazenados como objetos Date

## 📚 Documentação Detalhada

Para mais informações, consulte a pasta `docs/`:

- [Requisitos do Sistema](docs/system-requirements.md)
- [Tecnologias Utilizadas](docs/technologies.md)
- [Arquitetura do Projeto](docs/architecture.md)
- [Padrões de Projeto](docs/patterns.md)
- [Guia de Testes](docs/testing.md)

## 🐛 Debug no VS Code

O projeto está configurado para debug com VS Code usando o Node.js 22+.

1. Adicione breakpoints clicando na margem esquerda do editor
2. Pressione `F5` para iniciar o debug
3. Use Bruno ou qualquer cliente HTTP para testar os endpoints

## 🤝 Contribuindo

Este projeto está em desenvolvimento ativo. Sugestões e contribuições são bem-vindas!