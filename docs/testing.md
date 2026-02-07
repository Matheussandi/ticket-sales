# 🧪 Guia de Testes Unitários

Este documento descreve a estratégia de testes do sistema de vendas de ingressos, como executar e escrever testes.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Framework de Testes](#framework-de-testes)
- [Executando os Testes](#executando-os-testes)
- [Estrutura de Testes](#estrutura-de-testes)
- [Padrões e Convenções](#padrões-e-convenções)
- [Mocking e Isolamento](#mocking-e-isolamento)
- [Escrevendo Novos Testes](#escrevendo-novos-testes)
- [Cobertura de Código](#cobertura-de-código)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O projeto utiliza **testes unitários** para garantir que componentes individuais funcionem corretamente de forma isolada. Os testes focam em:

- ✅ **Autenticação e Autorização** (AuthService, authMiddleware)
- ✅ **Regras de Negócio** (Services)
- ✅ **Middlewares** (CORS, Auth)
- 🔜 **Models** (Active Record patterns)
- 🔜 **Controllers** (HTTP handlers)

### Por que Testes?

- **Confiança**: Mudanças no código não quebram funcionalidades existentes
- **Documentação**: Testes servem como documentação executável
- **Refatoração Segura**: Permite melhorar código com segurança
- **Detecção Precoce**: Bugs são encontrados antes de chegar em produção

---

## Framework de Testes

### Node.js Test Runner (Nativo)

O projeto usa o **test runner nativo do Node.js 22+**, que oferece:

- ✅ **Zero dependências externas** - Built-in no Node.js
- ✅ **TypeScript nativo** - Funciona com `--experimental-strip-types`
- ✅ **Suporte ESM completo** - Compatível com `"type": "module"`
- ✅ **API moderna** - Similar ao Vitest/Jest
- ✅ **Mock nativo** - Sistema de mocking built-in

### Por que não Vitest/Jest?

Nosso projeto usa features experimentais do Node.js 22 (`--experimental-strip-types`). O test runner nativo:
- Não requer configuração adicional
- Não adiciona peso ao projeto
- Funciona perfeitamente com nosso setup experimental

---

## Executando os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes uma vez
npm test

# Executar testes em modo watch (re-executa ao salvar)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Output Esperado

```
✔ AuthService > login > deve retornar um token quando credenciais são válidas (5ms)
✔ AuthService > login > deve lançar InvalidCredentialsError quando usuário não existe (2ms)
✔ authMiddleware > Rotas não protegidas > deve permitir acesso a POST /auth/login (1ms)
...

ℹ tests 15
ℹ suites 2
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 156.789
```

### Executando Testes Específicos

```bash
# Apenas testes do AuthService
node --env-file .env --experimental-strip-types --test src/services/auth-service.test.ts

# Apenas testes de middlewares
node --env-file .env --experimental-strip-types --test src/middlewares/**/*.test.ts
```

---

## Estrutura de Testes

### Organização de Arquivos

```
src/
├── services/
│   ├── auth-service.ts           # Código de produção
│   └── auth-service.test.ts      # Testes do serviço
├── middlewares/
│   ├── auth-middleware.ts        # Código de produção
│   └── auth-middleware.test.ts   # Testes do middleware
└── __tests__/
    └── helpers/
        └── mock-factory.ts       # Utilitários de teste
```

**Convenção**: Arquivos de teste ficam ao lado do código que testam, com sufixo `.test.ts`

### Anatomia de um Arquivo de Teste

```typescript
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";

describe("NomeDoComponente", () => {
  // Setup executado antes de cada teste
  beforeEach(() => {
    mock.restoreAll();
  });

  describe("nomeDaFuncionalidade", () => {
    it("deve fazer algo específico quando condição X", async () => {
      // Arrange - Preparar dados de teste
      const input = "valor";

      // Act - Executar ação
      const result = await funcao(input);

      // Assert - Verificar resultado
      assert.strictEqual(result, "esperado");
    });
  });
});
```

---

## Padrões e Convenções

### Padrão AAA (Arrange-Act-Assert)

Todos os testes seguem este padrão:

```typescript
it("deve fazer X quando Y", async () => {
  // 1. Arrange - Preparar dados e mocks
  const mockData = { id: 1, name: "Test" };
  mockFunction.mockReturnValue(mockData);

  // 2. Act - Executar a ação a ser testada
  const result = await service.doSomething();

  // 3. Assert - Verificar se o resultado é o esperado
  assert.strictEqual(result.id, 1);
});
```

### Nomenclatura de Testes

✅ **Bom**: Descreve o comportamento esperado
```typescript
it("deve retornar 401 quando token não é fornecido")
it("deve anexar usuário ao request quando token é válido")
it("deve lançar erro quando senha está incorreta")
```

❌ **Ruim**: Apenas descreve a implementação
```typescript
it("testa login")
it("verifica token")
it("valida usuário")
```

### Agrupamento com describe()

```typescript
describe("AuthService", () => {
  describe("login", () => {
    it("cenário de sucesso 1");
    it("cenário de sucesso 2");
    it("cenário de erro 1");
  });

  describe("logout", () => {
    it("cenário de sucesso");
  });
});
```

---

## Mocking e Isolamento

### Por que Mockar?

Testes unitários devem ser:
- **Rápidos** - Não acessam banco de dados real
- **Isolados** - Testam apenas uma unidade de código
- **Determinísticos** - Sempre produzem o mesmo resultado

### Mocking com Node.js Test Runner

#### Mockar Funções de Módulos

```typescript
// Importar o módulo que contém a função
const { UserModel } = await import("../model/user-model.ts");

// Mockar método estático
mock.method(UserModel, "findByEmail", () => 
  Promise.resolve(mockUser)
);

// Mockar método de instância
const userService = new UserService();
mock.method(userService, "findById", () => 
  Promise.resolve(mockUser)
);
```

#### Mockar Bibliotecas Externas

```typescript
// Mockar bcrypt
const bcrypt = await import("bcrypt");
mock.method(bcrypt, "compareSync", () => true);

// Mockar jwt
const jwt = await import("jsonwebtoken");
mock.method(jwt, "verify", () => ({ id: 1, email: "test@example.com" }));
```

#### Verificar Chamadas de Mocks

```typescript
const mockFn = mock.fn();
mockFn("arg1", "arg2");

// Verificar quantas vezes foi chamado
assert.strictEqual(mockFn.mock.calls.length, 1);

// Verificar argumentos da primeira chamada
assert.strictEqual(mockFn.mock.calls[0].arguments[0], "arg1");
```

#### Limpar Mocks

```typescript
beforeEach(() => {
  // Restaura todos os mocks antes de cada teste
  mock.restoreAll();
});
```

### Mock Factory Helper

O arquivo `src/__tests__/helpers/mock-factory.ts` contém funções utilitárias para criar mocks comuns:

```typescript
import { createMockRequest, createMockResponse, createMockNext } from "../__tests__/helpers/mock-factory.ts";

// Criar mock de Request do Express
const req = createMockRequest({
  method: "POST",
  path: "/login",
  body: { email: "test@example.com" }
});

// Criar mock de Response do Express
const res = createMockResponse();
// res.json, res.status, res.send são funções mockadas

// Criar mock de NextFunction
const next = createMockNext();
```

---

## Escrevendo Novos Testes

### Checklist para Novos Testes

- [ ] Arquivo `.test.ts` criado ao lado do código de produção
- [ ] Imports corretos (node:test, node:assert)
- [ ] `describe()` para agrupar testes relacionados
- [ ] `beforeEach()` para limpar mocks
- [ ] Testes seguem padrão AAA
- [ ] Nomenclatura descritiva ("deve ... quando ...")
- [ ] Todos os cenários importantes cobertos:
  - [ ] Casos de sucesso
  - [ ] Casos de erro
  - [ ] Casos extremos (edge cases)

### Template de Teste

```typescript
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { MinhaClasse } from "./minha-classe.ts";

describe("MinhaClasse", () => {
  let instancia: MinhaClasse;

  beforeEach(() => {
    mock.restoreAll();
    instancia = new MinhaClasse();
  });

  describe("meuMetodo", () => {
    it("deve retornar X quando Y", async () => {
      // Arrange
      const input = "teste";

      // Act
      const result = await instancia.meuMetodo(input);

      // Assert
      assert.strictEqual(result, "esperado");
    });

    it("deve lançar erro quando Z", async () => {
      // Arrange
      const inputInvalido = null;

      // Act & Assert
      await assert.rejects(
        async () => {
          await instancia.meuMetodo(inputInvalido);
        },
        {
          name: "MeuErroCustomizado",
        }
      );
    });
  });
});
```

### Exemplos de Asserções Comuns

```typescript
// Igualdade estrita
assert.strictEqual(valor, esperado);

// Igualdade profunda (objetos/arrays)
assert.deepStrictEqual(objeto, objetoEsperado);

// Verificar se é verdadeiro
assert.ok(condicao);

// Verificar que função lança erro
await assert.rejects(async () => {
  await funcao();
}, ErrorType);

// Verificar que função não lança erro
await assert.doesNotReject(async () => {
  await funcao();
});
```

---

## Cobertura de Código

### Gerando Relatório de Cobertura

```bash
npm run test:coverage
```

### Interpretando a Cobertura

A cobertura mede qual porcentagem do código foi executada durante os testes:

```
file           | line % | branch % | funcs % | uncovered lines
---------------|--------|----------|---------|----------------
auth-service.ts|  95.00 |    90.00 |  100.00 | 23-24
auth-middleware|  100.00|   100.00 |  100.00 |
```

- **line %**: Porcentagem de linhas executadas
- **branch %**: Porcentagem de condições (if/else) testadas
- **funcs %**: Porcentagem de funções executadas
- **uncovered lines**: Linhas não cobertas

### Metas de Cobertura

- 🎯 **Objetivo**: 80%+ de cobertura
- ⚠️ **Mínimo aceitável**: 70%
- 🚫 **Crítico**: < 60% (precisa melhorar)

---

## Testes Implementados

### AuthService (`src/services/auth-service.test.ts`)

**Cobertura**: Login e autenticação

| Teste | Descrição |
|-------|-----------|
| ✅ Credenciais válidas | Retorna token JWT quando login é bem-sucedido |
| ✅ Usuário inexistente | Lança `InvalidCredentialsError` |
| ✅ Senha incorreta | Lança `InvalidCredentialsError` |
| ✅ JWT_SECRET do ambiente | Usa variável de ambiente quando disponível |
| ✅ Payload do token | Inclui id e email no token |
| ✅ Expiração do token | Configura expiração para 1 hora |

### authMiddleware (`src/middlewares/auth-middleware.test.ts`)

**Cobertura**: Autenticação e autorização de rotas

| Teste | Descrição |
|-------|-----------|
| ✅ Rotas públicas | Permite acesso sem token a rotas não protegidas |
| ✅ Token ausente | Retorna 401 quando token não é fornecido |
| ✅ Token inválido | Retorna 401 quando token JWT é inválido |
| ✅ Usuário não encontrado | Retorna 401 quando usuário não existe |
| ✅ Token válido | Anexa usuário ao request |
| ✅ Extração do token | Extrai token do header Bearer corretamente |
| ✅ JWT_SECRET do ambiente | Usa variável de ambiente |

---

## Troubleshooting

### Problema: "Cannot find module"

**Causa**: Importação de módulo incorreta

**Solução**: Certifique-se de incluir a extensão `.ts` nos imports
```typescript
// ✅ Correto
import { AuthService } from "../services/auth-service.ts";

// ❌ Incorreto
import { AuthService } from "../services/auth-service";
```

### Problema: "Mock is not a function"

**Causa**: Mock não foi configurado corretamente

**Solução**: Use `mock.method()` ou `mock.fn()`
```typescript
// ✅ Correto
const mockFn = mock.fn(() => "result");
mock.method(objeto, "metodo", () => "result");

// ❌ Incorreto
const mockFn = () => "result";
```

### Problema: "AssertionError [ERR_ASSERTION]"

**Causa**: Valor esperado não corresponde ao valor real

**Solução**: Verifique o que está sendo comparado
```typescript
// Use console.log para debug
console.log("Valor recebido:", result);
console.log("Valor esperado:", expected);

// Ou use deepStrictEqual para objetos
assert.deepStrictEqual(objeto, objetoEsperado);
```

### Problema: Testes passam isoladamente mas falham juntos

**Causa**: Estado compartilhado entre testes (mocks não limpos)

**Solução**: Use `beforeEach()` para limpar estado
```typescript
beforeEach(() => {
  mock.restoreAll();
  // Limpar qualquer outro estado compartilhado
});
```

### Problema: "Cannot find module 'node:test'"

**Causa**: Versão do Node.js < 18

**Solução**: Atualize para Node.js 22.15.1+ (requisito do projeto)
```bash
node --version  # Deve ser >= 22.15.1
```

### Problema: Variáveis de ambiente não carregam

**Causa**: Arquivo `.env` não está sendo lido

**Solução**: Certifique-se de usar `--env-file .env`
```bash
node --env-file .env --experimental-strip-types --test src/**/*.test.ts
```

---

## Próximos Passos

### Testes a Serem Implementados

- [ ] **CustomerService**: Registro e operações de clientes
- [ ] **PartnerService**: Registro e operações de parceiros
- [ ] **EventService**: CRUD de eventos
- [ ] **TicketService**: Criação e gerenciamento de tickets
- [ ] **PurchaseService**: Processamento de compras
- [ ] **Controllers**: Testes de integração dos endpoints
- [ ] **CORS Middleware**: Validação de origens permitidas

### Melhorias Futuras

- [ ] **CI/CD**: Executar testes automaticamente no GitHub Actions
- [ ] **Testes de Integração**: Testar fluxos completos
- [ ] **Testes E2E**: Testar API via requisições HTTP reais
- [ ] **Performance Tests**: Validar performance sob carga
- [ ] **Mutation Testing**: Testar a qualidade dos testes

---

## Referências

- [Node.js Test Runner](https://nodejs.org/docs/latest-v22.x/api/test.html)
- [Node.js Assert](https://nodejs.org/docs/latest-v22.x/api/assert.html)
- [Padrão AAA](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)
- [Test-Driven Development (TDD)](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## Dicas Finais

💡 **Escreva testes antes ou durante o desenvolvimento**, não depois

💡 **Um teste deve testar apenas uma coisa**

💡 **Testes devem ser independentes** - não depender de ordem de execução

💡 **Mantenha testes simples** - se o teste é complexo, o código também é

💡 **Use nomes descritivos** - o teste deve documentar o comportamento

💡 **Prefira muitos testes pequenos** a poucos testes grandes

---

**Última atualização**: 7 de fevereiro de 2026
