import { Router } from "express";
import * as mysql from "mysql2/promise";
import { createConnection } from "../database.ts";
import { PartnerService } from "../services/partner-service.ts";
import { EventService } from "../services/event-service.ts";

export const partnerRouter = Router();

partnerRouter.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const partnerService = new PartnerService();

  const result = await partnerService.register({
    name,
    email,
    password,
    company_name,
  });

  res.status(201).json(result);
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

    const eventService = new EventService();
    const result = await eventService.create({
      name,
      description,
      date,
      location,
      partnerId: partner.id,
    });

    res.status(201).json(result);
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

    const eventService = new EventService();
    const result = await eventService.findAll(partner.id);

    res.json(result);
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

    const eventService = new EventService();
    const event = await eventService.findById(Number(eventId));

    if (!event || event.partner_id !== partner.id) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve event" });
  } finally {
    await connection.end();
  }
});