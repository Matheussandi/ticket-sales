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
 */
export const corsMiddleware = () => {
  return cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
};
