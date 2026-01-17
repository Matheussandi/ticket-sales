import { Router } from "express";

import { EventService } from "../services/event-service.ts";

export const eventsRouter = Router();

eventsRouter.post("/", async (req, res) => {
  const { name, description, date, location } = req.body;

    const eventService = new EventService();

  const result = await eventService.create({
    name,
    description,
    date: new Date(date),
    location,
    partnerId: req.user!.id,
  });

  res.status(201).json(result);
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
