import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { Database } from "../database.ts";

export class PartnerService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company_name: string;
  }) {
    const { name, email, password, company_name } = data;

    const connection = Database.getInstance();

    try {
      await connection.beginTransaction();

      const createdAt = new Date();
      const hashedPassword = bcrypt.hashSync(password, 10);

      const [userResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, createdAt]
      );

      const userId = userResult.insertId;

      const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
        [userId, company_name, createdAt]
      );

      await connection.commit();

      return {
        id: partnerResult.insertId,
        name,
        user_id: userId,
        company_name,
        created_at: createdAt,
      };
    } catch (error) {
      await connection.rollback();
      throw new Error("Registration failed: " + (error as Error).message);
    }
  }

  async findByUserId(userId: number) {
    const connection = Database.getInstance();

    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    return partner;
  }
}
