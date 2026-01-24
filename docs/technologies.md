# 🛠️ Tecnologias Utilizadas

Este documento descreve todas as tecnologias, bibliotecas e ferramentas utilizadas no projeto.

## Runtime e Linguagem

### Node.js v22.15.1+
- **Descrição**: Runtime JavaScript assíncrono baseado no motor V8 do Chrome
- **Por que usamos**: Performance, grande ecossistema de pacotes, suporte nativo a TypeScript (--experimental-strip-types)
- **Documentação**: https://nodejs.org/

### TypeScript 5.9+
- **Descrição**: Superset tipado do JavaScript
- **Por que usamos**: Tipagem estática para maior segurança e melhor experiência de desenvolvimento
- **Documentação**: https://www.typescriptlang.org/

## Framework Web

### Express 5.2+
- **Descrição**: Framework web minimalista e flexível para Node.js
- **Por que usamos**: Simplicidade, grande comunidade, middleware extensível
- **Uso no projeto**: 
  - Roteamento de requisições HTTP
  - Middleware de autenticação
  - Parsing de JSON
- **Documentação**: https://expressjs.com/

## Banco de Dados

### MySQL
- **Descrição**: Sistema de gerenciamento de banco de dados relacional
- **Por que usamos**: Confiabilidade, performance, suporte a transações ACID
- **Uso no projeto**:
  - Armazenamento de usuários, parceiros, clientes
  - Armazenamento de eventos e tickets
  - Controle de compras e reservas

### mysql2/promise 3.16+
- **Descrição**: Cliente MySQL para Node.js com suporte a Promises
- **Por que usamos**: API moderna com async/await, connection pooling
- **Uso no projeto**:
  - Pool de conexões configurável
  - Execução de queries parametrizadas
  - Suporte a transações

## Autenticação e Segurança

### JSON Web Token (JWT)
- **Pacote**: `jsonwebtoken`
- **Descrição**: Padrão para criação de tokens de acesso
- **Por que usamos**: Autenticação stateless, escalabilidade
- **Uso no projeto**:
  - Geração de tokens após login
  - Validação de tokens em rotas protegidas
  - Payload com `id` e `email` do usuário

### bcrypt
- **Descrição**: Biblioteca para hash de senhas
- **Por que usamos**: Algoritmo seguro com salt automático, resistente a ataques de força bruta
- **Configuração**: 10 rounds de salt
- **Uso no projeto**:
  - Hash de senhas no cadastro
  - Comparação de senhas no login

## Containerização

### Docker
- **Descrição**: Plataforma de containerização
- **Por que usamos**: Ambiente consistente, facilidade de deploy
- **Uso no projeto**: Container para o banco de dados MySQL

### Docker Compose
- **Descrição**: Ferramenta para definir e executar aplicações multi-container
- **Por que usamos**: Orquestração simples de serviços
- **Uso no projeto**:
  - Definição do serviço MySQL
  - Configuração de volumes e rede
  - Script de inicialização do banco

## Ferramentas de Desenvolvimento

### VS Code
- **Descrição**: Editor de código
- **Configurações no projeto**:
  - `launch.json` para debug nativo do Node.js 22+
  - Suporte a breakpoints em TypeScript

### Bruno
- **Descrição**: Cliente HTTP para testes de API
- **Por que usamos**: Open source, versionável, salvo em arquivos
- **Uso no projeto**: Coleção de requisições na pasta `bru/`

## Dependências do projeto

### Produção
```json
{
  "express": "^5.2+",
  "mysql2": "^3.16+",
  "jsonwebtoken": "^9.x",
  "bcrypt": "^5.x"
}
```

### Desenvolvimento
```json
{
  "@types/express": "^5.x",
  "@types/jsonwebtoken": "^9.x",
  "@types/bcrypt": "^5.x",
  "@types/node": "^22.x",
  "typescript": "^5.9+"
}
```

## Requisitos de Sistema

| Componente | Versão Mínima |
|------------|---------------|
| Node.js | 22.15.1 |
| npm | 10.x |
| Docker | 24.x |
| Docker Compose | 2.x |
| MySQL | 8.x |
