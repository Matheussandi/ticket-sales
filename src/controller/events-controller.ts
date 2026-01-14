import { Router } from "express";
import * as mysql from "mysql2/promise";
import { EventService } from "../services/event-service.ts";
import { Database } from "../database.ts";

export const eventsRouter = Router();

eventsRouter.post("/", async (req, res) => {
  const { name, description, date, location } = req.body;

  const connection = Database.getInstance();

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
});

eventsRouter.get("/", async (req, res) => {
  const eventService = new EventService();
  const result = await eventService.findAll();
  res.status(200).json(result);
});

eventsRouter.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const eventService = new EventService();
  const event = await eventService.findById(Number(eventId));

  if (event) {
    res.status(200).json(event);
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});
