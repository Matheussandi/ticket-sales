import { Router } from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createConnection } from "../database.ts";
import { AuthService } from "../services/auth-service.ts";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const authService = new AuthService();
  const token = await authService.login(email, password);
  res.status(200).json(token);
});
