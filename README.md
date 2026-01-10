# 🎫 Sistema de Vendas de Ingressos

> **⚠️ Projeto em Desenvolvimento**
> 
> Este projeto está atualmente em fase de desenvolvimento ativo. Funcionalidades e APIs podem sofrer alterações.

## 📋 Sobre o Projeto

Sistema de vendas de ingressos para eventos, desenvolvido com Node.js, TypeScript, Express e MySQL.

## 🚀 Tecnologias

- **Node.js** v22.15.1+
- **TypeScript** 5.9+
- **Express** 5.2+
- **MySQL** 3.16+
- **Docker** & Docker Compose
- **bcrypt** - Criptografia de senhas
- **JWT** - Autenticação

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar banco de dados com Docker
docker-compose up -d

# Executar em modo de desenvolvimento
npm run dev
```

## 🐛 Debug no VS Code

O projeto está configurado para debug com VS Code usando o tipo de execução nativo do Node.js 22+.

### Como usar o debugger:

1. **Colocar breakpoints**: Clique na margem esquerda do editor (ao lado dos números de linha) para adicionar um ponto vermelho de parada

2. **Iniciar debug**: 
   - Pressione `F5` ou
   - Vá em "Executar > Iniciar Depuração" ou
   - Use o ícone de play na aba "Executar e Depurar"

3. **Controles de debug**:
   - **Continuar** (F5): Executa até o próximo breakpoint
   - **Step Over** (F10): Executa a linha atual
   - **Step Into** (F11): Entra dentro de funções
   - **Step Out** (Shift+F11): Sai da função atual
   - **Restart** (Ctrl+Shift+F5): Reinicia o debug
   - **Stop** (Shift+F5): Para o debug

4. **Testar endpoints**: Com o debug rodando, use o Bruno (pasta `bruno/`) ou qualquer cliente HTTP para fazer requisições à API

### Configuração do Debug

A configuração está em `.vscode/launch.json` e utiliza:
- `--experimental-strip-types`: Processa TypeScript nativamente no Node 22+
- `--env-file .env`: Carrega variáveis de ambiente
- `--no-warnings`: Remove warnings experimentais

## 📁 Estrutura do Projeto

```
vendas-ingresso/
├── src/
│   ├── app.ts              # Aplicação principal
│   └── types/              # Definições de tipos TypeScript
├── bruno/                  # Coleção de requisições HTTP
├── .vscode/
│   └── launch.json         # Configuração de debug
├── docker-compose.yml      # Configuração do MySQL
├── init.sql                # Script de inicialização do banco
└── package.json            # Dependências e scripts
```

## 🔑 Endpoints da API

### Autenticação
- `POST /auth/login` - Login de usuário

### Parceiros (Partners)
- `POST /partners/register` - Registro de parceiro
- `POST /partners/events` - Criar evento (requer autenticação)
- `GET /partners/events` - Listar eventos do parceiro
- `GET /partners/events/:eventId` - Detalhes de um evento

### Clientes (Customers)
- `POST /customers/register` - Registro de cliente

### Eventos (Events)
- `GET /events` - Listar todos os eventos (público)
- `GET /events/:eventId` - Detalhes de um evento (público)
- `POST /events` - Criar evento (requer autenticação)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Build do projeto
npm run build

# Executar versão compilada
npm start
```

## 📝 Convenções

- Autenticação via JWT no header `Authorization: Bearer <token>`
- Senhas são criptografadas com bcrypt (10 rounds)
- Timestamps são armazenados como objetos Date

## 🤝 Contribuindo

Este projeto está em desenvolvimento ativo. Sugestões e contribuições são bem-vindas!