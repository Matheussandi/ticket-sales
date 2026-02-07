import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { AuthService, InvalidCredentialsError } from "../services/auth-service.ts";

/**
 * Testes unitários para AuthService
 * 
 * Testa o serviço de autenticação, incluindo:
 * - Login com credenciais inválidas
 * - Geração de token JWT (estrutura)
 * - Tratamento de erros
 * 
 * Nota: Estes testes focam na lógica de negócio sem mockar profundamente
 * dependências externas (bcrypt, jwt), pois o Node.js test runner tem limitações.
 */

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    mock.restoreAll();
  });

  describe("login", () => {
    it("deve lançar InvalidCredentialsError quando usuário não existe", async () => {
      // Arrange
      const email = "inexistente@example.com";
      const password = "senha123";

      // Mockar UserModel.findByEmail para retornar null
      const { UserModel } = await import("../model/user-model.ts");
      mock.method(UserModel, "findByEmail", () => 
        Promise.resolve(null)
      );

      // Act & Assert
      await assert.rejects(
        async () => {
          await authService.login(email, password);
        },
        (error: any) => {
          assert.strictEqual(error.name, "InvalidCredentialsError");
          assert.strictEqual(error.message, "Invalid credentials");
          return true;
        }
      );
    });

    it("deve ter InvalidCredentialsError com nome correto", () => {
      // Arrange & Act
      const error = new InvalidCredentialsError();

      // Assert
      assert.strictEqual(error.name, "InvalidCredentialsError");
      assert.strictEqual(error.message, "Invalid credentials");
      assert.ok(error instanceof Error);
    });

    it("deve chamar UserModel.findByEmail com email correto", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "senha123";

      const { UserModel } = await import("../model/user-model.ts");
      const findByEmailMock = mock.method(UserModel, "findByEmail", (() => 
        Promise.resolve(null)
      ));

      // Act
      try {
        await authService.login(email, password);
      } catch (error) {
        // Esperado que lance erro
      }

      // Assert - Verificar que UserModel.findByEmail foi chamado corretamente
      assert.strictEqual(findByEmailMock.mock.calls.length, 1);
      assert.strictEqual(findByEmailMock.mock.calls[0].arguments[0], email);
    });

    it("deve retornar objeto com propriedade token quando login é bem-sucedido", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "senha123";
      
      // Hash real da senha "senha123" usando bcrypt
      const bcrypt = await import("bcrypt");
      const hashedPassword = bcrypt.hashSync(password, 10);

      const mockUser = {
        id: 1,
        name: "Test User",
        email: email,
        password: hashedPassword,
      };

      // Mockar UserModel.findByEmail para retornar usuário com senha hasheada real
      const { UserModel } = await import("../model/user-model.ts");
      mock.method(UserModel, "findByEmail", () => 
        Promise.resolve(mockUser as any)
      );

      // Act
      const result = await authService.login(email, password);

      // Assert
      assert.ok(result);
      assert.ok(result.token);
      assert.strictEqual(typeof result.token, "string");
      assert.ok(result.token.length > 0);
    });

    it("deve gerar token JWT válido com payload correto", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "senha123";
      const userId = 42;
      
      const bcrypt = await import("bcrypt");
      const hashedPassword = bcrypt.hashSync(password, 10);

      const mockUser = {
        id: userId,
        name: "Test User",
        email: email,
        password: hashedPassword,
      };

      const { UserModel } = await import("../model/user-model.ts");
      mock.method(UserModel, "findByEmail", () => 
        Promise.resolve(mockUser as any)
      );

      // Act
      const result = await authService.login(email, password);

      // Assert - Decodificar token para verificar payload
      const jwtModule = await import("jsonwebtoken");
      const jwt = jwtModule.default || jwtModule;
      const jwtSecret = process.env.JWT_SECRET || "your_secret_key";
      const decoded: any = jwt.verify(result.token, jwtSecret);
      
      assert.strictEqual(decoded.id, userId);
      assert.strictEqual(decoded.email, email);
      assert.ok(decoded.exp); // Token deve ter expiração
      assert.ok(decoded.iat); // Token deve ter issued at
    });
  });
});
