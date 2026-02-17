import { Router } from "express";
import { TicketService } from "../services/ticket-service.ts";
import { PartnerService } from "../services/partner-service.ts";

export const ticketRoutes = Router();

ticketRoutes.post("/:eventId/tickets", async (req, res) => {
  const userId = req.user?.id;

  if (req.user!.role !== 'partner') {
    return res.status(403).json({ error: "Only partners can create tickets" });
  }

  const partnerService = new PartnerService();
  const partner = await partnerService.findByUserId(userId!);

  if (!partner) {
    return res.status(403).json({ error: "Partner profile not found" });
  }

  const { num_tickets, price } = req.body;
  const { eventId } = req.params;

  const ticketService = new TicketService();

  await ticketService.createMany({
    event_id: Number(eventId),
    numTickets: num_tickets,
    price,
  });

  res.status(204).send();
});

ticketRoutes.get("/:eventId/tickets", async (req, res) => {
  const { eventId } = req.params;
  const ticketService = new TicketService();

  const tickets = await ticketService.findByEventId(Number(eventId));

  res.json(tickets);
});

ticketRoutes.get("/:eventId/tickets/:ticketId", async (req, res) => {
  const { eventId, ticketId } = req.params;
  const ticketService = new TicketService();

  const ticket = await ticketService.findById(Number(eventId), Number(ticketId));

  if (!ticket || ticket.event_id !== Number(eventId)) {
    return res.status(404).json({ error: "Ticket not found for this event." });
  }

  res.json(ticket);
});