import * as mysql from "mysql2/promise";
import { Database } from "../database.ts";

export class UserService {
  async findById(userId: number) {
    const connection = Database.getInstance();

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    return rows.length ? rows[0] : null;
  }
}
