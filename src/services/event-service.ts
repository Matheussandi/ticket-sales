import * as mysql from "mysql2/promise";
import { Database } from "../database.ts";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;

    const connection = Database.getInstance();

    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (partner_id, name, description, date, location, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [partnerId, name, description, eventDate, location, createdAt]
    );

    return {
      id: eventResult.insertId,
      partner_id: partnerId,
      name,
      description,
      date: eventDate,
      location,
      created_at: createdAt,
    };
  }

  async findAll(partnerId?: number) {
    const connection = Database.getInstance();

    const query = partnerId
      ? "SELECT * FROM events WHERE partner_id = ?"
      : "SELECT * FROM events";

    const params = partnerId ? [partnerId] : [];

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      query,
      params
    );

    return eventRows;
  }

  async findById(id: number) {
    const connection = Database.getInstance();

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    return eventRows.length > 0 ? eventRows[0] : null;
  }
}
