import * as mysql from "mysql2/promise";
import { Database } from "../database.ts";
import bycript from "bcrypt";

export class UserModel {
  id: number;
  name: string;
  email: string;
  role?: 'customer' | 'partner';
  password?: string;
  created_at?: Date;

  constructor(data: Partial<UserModel>) {
    this.fill(data);
  }

  static async create(
    data: {
      name: string;
      email: string;
      password: string;
      role: 'customer' | 'partner';
    },
    options?: { connection?: mysql.Connection }
  ): Promise<UserModel> {
    const db = options?.connection ?? Database.getInstance();

    const { name, email, password, role } = data;

    const createdAt = new Date();
    const hashedPassword = UserModel.hashPassword(password);

    const [userResult] = await db.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, role, password, created_at) VALUES (?, ?, ?, ?, ?)",
      [name, email, role, hashedPassword, createdAt]
    );

    const user = new UserModel({
      ...data,
      password: hashedPassword,
      created_at: createdAt,
      id: userResult.insertId,
    });

    return user;
  }

  static hashPassword(password: string): string {
    return bycript.hashSync(password, 10);
  }

  static comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): boolean {
    return bycript.compareSync(plainPassword, hashedPassword);
  }

  static async findById(id: number): Promise<UserModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findAll(): Promise<UserModel[]> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users"
    );
    return rows.map((row) => new UserModel(row as UserModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<mysql.ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [this.name, this.email, this.password, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<mysql.ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  // Método auxiliar para preencher o modelo com dados
  fill(data: Partial<UserModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.role !== undefined) this.role = data.role;
    if (data.password !== undefined) this.password = data.password;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}
