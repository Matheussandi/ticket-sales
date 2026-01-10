import { Router } from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { createConnection } from "../database.ts";

export const partnerRouter = Router();

partnerRouter.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;

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
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [userId, company_name, createdAt]
    );

    res.status(201).json({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      company_name,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});

partnerRouter.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;

  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (partner_id, name, description, date, location, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [partner.id, name, description, eventDate, location, createdAt]
    );

    res.status(201).json({
      id: eventResult.insertId,
      partner_id: partner.id,
      name,
      description,
      date: eventDate,
      location,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

partnerRouter.get("/events", async (req, res) => {
  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );

    res.status(200).json(eventRows);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

partnerRouter.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;

  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ? AND partner_id = ?",
      [eventId, partner.id]
    );

    const event = eventRows.length > 0 ? eventRows[0] : null;

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(eventRows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve event" });
  } finally {
    await connection.end();
  }
});