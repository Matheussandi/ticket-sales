import * as mysql from "mysql2/promise";
import { createConnection } from "../database.ts";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;

    const connection = await createConnection();

    try {
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
    } catch (error) {
      throw new Error("Failed to create event");
    } finally {
      await connection.end();
    }
  }

  async findAll(partnerId?: number) {
    const connection = await createConnection();

    try {
      const query = partnerId
        ? "SELECT * FROM events WHERE partner_id = ?"
        : "SELECT * FROM events";

      const params = partnerId ? [partnerId] : [];

      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        query,
        params
      );

      return eventRows;
    } catch (error) {
      throw new Error("Failed to create event");
    } finally {
      await connection.end();
    }
  }

  async findById(id: number) {
    const connection = await createConnection();

    try {
      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM events WHERE id = ?",
        [id]
      );

      return eventRows.length > 0 ? eventRows[0] : null;
    } catch (error) {
      throw new Error("Failed to retrieve event");
    } finally {
      await connection.end();
    }
  }
}
