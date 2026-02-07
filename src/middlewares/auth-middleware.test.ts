import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { authMiddleware, unprotectedPaths } from "../middlewares/auth-middleware.ts";
import { createMockRequest, createMockResponse, createMockNext } from "../__tests__/helpers/mock-factory.ts";

/**
 * Testes unitários para authMiddleware
 * 
 * Testa o middleware de autenticação JWT, incluindo:
 * - Permissão de rotas públicas sem autenticação
 * - Bloqueio de rotas protegidas sem token
 * - Tratamento de erros
 */

describe("authMiddleware", () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  describe("Rotas não protegidas", () => {
    it("deve permitir acesso a POST /auth/login sem token", async () => {
      // Arrange
      const req = createMockRequest({
        method: "POST",
        path: "/auth/login",
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
      assert.strictEqual(res.json.mock.calls.length, 0);
    });

    it("deve permitir acesso a POST /customers/register sem token", async () => {
      // Arrange
      const req = createMockRequest({
        method: "POST",
        path: "/customers/register",
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
      assert.strictEqual(res.json.mock.calls.length, 0);
    });

    it("deve permitir acesso a POST /partners/register sem token", async () => {
      // Arrange
      const req = createMockRequest({
        method: "POST",
        path: "/partners/register",
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
    });

    it("deve permitir acesso a GET /events sem token", async () => {
      // Arrange
      const req = createMockRequest({
        method: "GET",
        path: "/events",
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
    });

    it("deve permitir acesso a GET /events/123 sem token (subrotas de events)", async () => {
      // Arrange
      const req = createMockRequest({
        method: "GET",
        path: "/events/123",
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
    });

    it("deve ter 4 rotas não protegidas configuradas", () => {
      // Assert
      assert.strictEqual(unprotectedPaths.length, 4);
      assert.ok(unprotectedPaths.some(r => r.path === "/auth/login"));
      assert.ok(unprotectedPaths.some(r => r.path === "/customers/register"));
      assert.ok(unprotectedPaths.some(r => r.path === "/partners/register"));
      assert.ok(unprotectedPaths.some(r => r.path === "/events"));
    });
  });

  describe("Rotas protegidas", () => {
    it("deve retornar 401 quando token não é fornecido", async () => {
      // Arrange
      const req = createMockRequest({
        method: "GET",
        path: "/partners",
        headers: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(res.status.mock.calls.length, 1);
      assert.strictEqual(res.status.mock.calls[0].arguments[0], 401);
      assert.strictEqual(res.json.mock.calls.length, 1);
      assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
        error: "No token provided",
      });
      assert.strictEqual(next.mock.calls.length, 0);
    });

    it("deve retornar 401 quando header Authorization está malformado", async () => {
      // Arrange
      const req = createMockRequest({
        method: "GET",
        path: "/partners",
        headers: {
          authorization: "InvalidFormat",
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(res.status.mock.calls.length, 1);
      assert.strictEqual(res.status.mock.calls[0].arguments[0], 401);
    });

    it("deve retornar 401 quando token JWT é inválido", async () => {
      // Arrange
      const req = createMockRequest({
        method: "GET",
        path: "/partners",
        headers: {
          authorization: "Bearer invalid.token.here",
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(res.status.mock.calls.length, 1);
      assert.strictEqual(res.status.mock.calls[0].arguments[0], 401);
      assert.strictEqual(res.json.mock.calls.length, 1);
      assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
        error: "Invalid token",
      });
      assert.strictEqual(next.mock.calls.length, 0);
    });

    it("deve anexar usuário ao request quando token é válido", async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
      };

      // Gerar token JWT real
      const jwtModule = await import("jsonwebtoken");
      const jwt = jwtModule.default || jwtModule;
      const jwtSecret = process.env.JWT_SECRET || "your_secret_key";
      const validToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        jwtSecret,
        { expiresIn: "1h" }
      );

      const req = createMockRequest({
        method: "GET",
        path: "/partners",
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Mockar UserService.findById para retornar usuário
      const { UserService } = await import("../services/user-service.ts");
      mock.method(UserService.prototype, "findById", () => 
        Promise.resolve(mockUser as any)
      );

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(next.mock.calls.length, 1);
      assert.strictEqual(res.json.mock.calls.length, 0);
      assert.ok((req as any).user);
      assert.strictEqual((req as any).user.id, mockUser.id);
      assert.strictEqual((req as any).user.email, mockUser.email);
    });

    it("deve retornar 401 quando usuário do token não existe no banco", async () => {
      // Arrange
      // Gerar token JWT real para usuário inexistente
      const jwtModule = await import("jsonwebtoken");
      const jwt = jwtModule.default || jwtModule;
      const jwtSecret = process.env.JWT_SECRET || "your_secret_key";
      const validToken = jwt.sign(
        { id: 999, email: "inexistente@example.com" },
        jwtSecret,
        { expiresIn: "1h" }
      );

      const req = createMockRequest({
        method: "GET",
        path: "/partners",
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Mockar UserService.findById para retornar null
      const { UserService } = await import("../services/user-service.ts");
      mock.method(UserService.prototype, "findById", () => 
        Promise.resolve(null)
      );

      // Act
      await authMiddleware(req as any, res as any, next as any);

      // Assert
      assert.strictEqual(res.status.mock.calls.length, 1);
      assert.strictEqual(res.status.mock.calls[0].arguments[0], 401);
      assert.deepStrictEqual(res.json.mock.calls[0].arguments[0], {
        error: "User not found",
      });
      assert.strictEqual(next.mock.calls.length, 0);
    });
  });
});
