/**
 * Factory para criar mocks de objetos usados nos testes
 * 
 * Este arquivo centraliza a criação de mocks para facilitar
 * a manutenção e reutilização entre diferentes testes.
 */

import { mock } from "node:test";
import type { Request, Response, NextFunction } from "express";

/**
 * Cria um mock de Request do Express
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    path: "",
    method: "GET",
    ...overrides,
  };
};

/**
 * Cria um mock de Response do Express
 */
export const createMockResponse = (): Partial<Response> & {
  json: ReturnType<typeof mock.fn>;
  status: ReturnType<typeof mock.fn>;
  send: ReturnType<typeof mock.fn>;
} => {
  const res: any = {
    statusCode: 200,
  };

  res.json = mock.fn((data: any) => {
    res.body = data;
    return res;
  });

  res.status = mock.fn((code: number) => {
    res.statusCode = code;
    return res;
  });

  res.send = mock.fn((data: any) => {
    res.body = data;
    return res;
  });

  return res;
};

/**
 * Cria um mock de NextFunction do Express
 */
export const createMockNext = (): ReturnType<typeof mock.fn> => {
  return mock.fn();
};

/**
 * Cria um mock de UserModel
 */
export const createMockUser = (overrides: any = {}) => {
  return {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "$2b$10$hashedpassword",
    created_at: new Date(),
    ...overrides,
  };
};
