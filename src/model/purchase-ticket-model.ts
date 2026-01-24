import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { Database } from "../database.ts";

export class PurchaseTicketModel {
  id: number;
  purchase_id: number;
  ticket_id: number;

  constructor(data: Partial<PurchaseTicketModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      purchase_id: number;
      ticket_id: number;
    },
    options?: { connection?: PoolConnection },
  ): Promise<PurchaseTicketModel> {
    const db = options?.connection ?? Database.getInstance();

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO purchase_tickets (purchase_id, ticket_id) VALUES (?, ?)",
      [data.purchase_id, data.ticket_id],
    );

    const purchaseTicket = new PurchaseTicketModel({
      ...data,
      id: result.insertId,
    });

    return purchaseTicket;
  }

  static async createMany(
    data: {
      purchase_id: number;
      ticket_id: number;
    }[],
    options?: { connection?: PoolConnection },
  ): Promise<PurchaseTicketModel[]> {
    const db = options?.connection ?? Database.getInstance();

    if (data.length === 0) {
      return [];
    }

    const values = Array(data.length).fill("(?, ?)").join(", ");
    const params = data.flatMap((item) => [item.purchase_id, item.ticket_id]);

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO purchase_tickets (purchase_id, ticket_id) VALUES ${values}`,
      params,
    );

    const purchaseTickets: PurchaseTicketModel[] = [];
    for (let i = 0; i < data.length; i++) {
      purchaseTickets.push(
        new PurchaseTicketModel({
          id: result.insertId + i,
          purchase_id: data[i].purchase_id,
          ticket_id: data[i].ticket_id,
        }),
      );
    }

    return purchaseTickets;
  }

  static async findById(id: number): Promise<PurchaseTicketModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM purchase_tickets WHERE id = ?",
      [id],
    );
    return rows.length
      ? new PurchaseTicketModel(rows[0] as PurchaseTicketModel)
      : null;
  }

  static async findAll(filter?: {
    where?: { purchase_id?: number; ticket_id?: number };
  }): Promise<PurchaseTicketModel[]> {
    const db = Database.getInstance();
    let query = "SELECT * FROM purchase_tickets";
    const params = [];

    if (filter && filter.where) {
      const where = [];
      if (filter.where.purchase_id) {
        where.push("purchase_id = ?");
        params.push(filter.where.purchase_id);
      }
      if (filter.where.ticket_id) {
        where.push("ticket_id = ?");
        params.push(filter.where.ticket_id);
      }
      if (where.length > 0) {
        query += " WHERE " + where.join(" AND ");
      }
    }

    const [rows] = await db.execute<RowDataPacket[]>(query, params);
    return rows.map(
      (row) => new PurchaseTicketModel(row as PurchaseTicketModel),
    );
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE purchase_tickets SET purchase_id = ?, ticket_id = ? WHERE id = ?",
      [this.purchase_id, this.ticket_id, this.id],
    );
    if (result.affectedRows === 0) {
      throw new Error("Purchase ticket not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM purchase_tickets WHERE id = ?",
      [this.id],
    );
    if (result.affectedRows === 0) {
      throw new Error("Purchase ticket not found");
    }
  }

  fill(data: Partial<PurchaseTicketModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.purchase_id !== undefined) this.purchase_id = data.purchase_id;
    if (data.ticket_id !== undefined) this.ticket_id = data.ticket_id;
  }
}
