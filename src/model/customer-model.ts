import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Database } from "../database.ts";
import { UserModel } from "../model/user-model.ts";

export class CustomerModel {
  id: number;
  user_id: number;
  address: string;
  phone: string;
  created_at: Date;
  user?: UserModel;

  constructor(data: Partial<CustomerModel>) {
    Object.assign(this, data);
  }

  static async create(
    data: { user_id: number; address: string; phone: string },
    options?: { connection?: PoolConnection },
  ): Promise<CustomerModel> {
    const db = options?.connection ?? Database.getInstance();

    const created_at = new Date();
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [data.user_id, data.address, data.phone, created_at],
    );

    return new CustomerModel({
      id: result.insertId,
      ...data,
      created_at,
    });
  }

  static async findById(
    id: number,
    options?: { user?: boolean },
  ): Promise<CustomerModel | null> {
    const db = Database.getInstance();

    let query = "SELECT * FROM partners WHERE id = ?";

    if (options?.user) {
      query =
        "SELECT p.*, u.id as user_id, u.name as user_name, u.email as user_email, u.password as user_password, u.created_at as user_created_at FROM partners p JOIN users u ON p.user_id = u.id WHERE p.id = ?";
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findByUserId(
    userId: number,
    options?: { user?: boolean },
  ): Promise<CustomerModel | null> {
    const db = Database.getInstance();

    let query = "SELECT * FROM customers WHERE user_id = ?";

    if (options?.user) {
      query =
        "SELECT c.*, u.id as user_id, u.name as user_name, u.email as user_email, u.password as user_password, u.created_at as user_created_at FROM customers c JOIN users u ON c.user_id = u.id WHERE c.user_id = ?";
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) {
      return null;
    }

    const customer = new CustomerModel(rows[0] as CustomerModel);

    if (options?.user) {
      customer.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return customer;
  }

  static async findAll(): Promise<CustomerModel[]> {
    const db = Database.getInstance();
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM customers");
    return rows.map((row) => new CustomerModel(row as CustomerModel));
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE customers SET user_id = ?, address = ?, phone = ? WHERE id = ?",
      [this.user_id, this.address, this.phone, this.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }

    return;
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM customers WHERE id = ?",
      [this.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }

    return;
  }
}
