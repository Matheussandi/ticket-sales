import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createConnection } from "../database.ts";

export class AuthService {
  async login(email: string, password: string) {
    const connection = await createConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      const user = rows.length > 0 ? rows[0] : null;

      if (!user) {
        throw new InvalidCredentialsError("Invalid credentials");
      }

      const passwordMatch = bcrypt.compareSync(password, user?.password);
      if (!passwordMatch) {
        throw new InvalidCredentialsError("Invalid credentials");
      }
      
      const token = jwt.sign(
        { id: user?.id, email: user?.email },
        "your_secret_key",
        { expiresIn: "1h" }
      );

      return { token };
    } catch (error) {
      throw new Error("Database connection error");
    } finally {
      await connection.end();
    }
  }
}

export class InvalidCredentialsError extends Error {}
