import { Router } from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { createConnection } from "../database.ts";

export const customerRouter = Router();

customerRouter.post("/register", async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  const connection = await createConnection();

  try {
    const createdAt = new Date();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const [userResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, createdAt]
    );

    const userId = userResult.insertId;

    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [userId, address, phone, createdAt]
    );

    res.status(201).json({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      address,
      phone,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});