import { Router } from "express";
import * as mysql from "mysql2/promise";
import { createConnection } from "../database.ts";

export const eventsRouter = Router();

eventsRouter.post("/", async (req, res) => {
  const { name, description, date, location } = req.body;

  const connection = await createConnection();

  try {
    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at) VALUES (?, ?, ?, ?, ?)",
      [name, description, eventDate, location, createdAt]
    );

    res.status(201).json({
      id: eventResult.insertId,
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

eventsRouter.get("/", async (req, res) => {
  const connection = await createConnection();

  try {
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events"
    );

    res.status(200).json(eventRows);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

eventsRouter.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;

  const connection = await createConnection();

  try {
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    const event = eventRows.length > 0 ? eventRows[0] : null;

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});