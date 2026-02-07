import cors from "cors";

/**
 * Middleware de configuração CORS
 * 
 * Permite requisições do front-end configurado via variável de ambiente CORS_ORIGIN.
 * Por padrão, permite http://localhost:3000 para desenvolvimento local.
 * 
 * Configurações:
 * - origin: Origem permitida (configurável via env)
 * - credentials: true (permite envio de cookies/headers de autenticação)
 * - methods: Métodos HTTP permitidos
 * - allowedHeaders: Headers que o front-end pode enviar
 * - exposedHeaders: Headers que o front-end pode ler na resposta
 * - preflightContinue: false (finaliza preflight no middleware)
 * - optionsSuccessStatus: 204 (código de sucesso para OPTIONS)
 */
export const corsMiddleware = () => {
  return cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Length", "Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
};
