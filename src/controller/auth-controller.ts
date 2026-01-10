import { Router } from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createConnection } from "../database.ts";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const passwordMatch = bcrypt.compareSync(password, user?.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user?.id, email: user?.email },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Database connection error" });
  } finally {
    await connection.end();
  }
});
