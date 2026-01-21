import type { RowDataPacket } from "mysql2/promise";
import { Database } from "../database.ts";
import { EventModel } from "../model/event-model.ts";
import { TicketModel, TicketStatus } from "../model/ticket-model.ts";

export class TicketService {
  async createMany(data: {
    event_id: number;
    numTickets: number;
    price: number;
  }) {
    const MAX_TICKETS_PER_REQUEST = 100;

    if (data.numTickets <= 0) {
      throw new Error("Number of tickets must be greater than 0");
    }

    if (data.numTickets > MAX_TICKETS_PER_REQUEST) {
      throw new Error(
        `Cannot create more than ${MAX_TICKETS_PER_REQUEST} tickets at once`,
      );
    }

    const event = await EventModel.findById(data.event_id);

    if (!event) {
      throw new Error("Event not found");
    }

    const ticketsData = Array(data.numTickets)
      .fill({})
      .map((_, index) => ({
        location: `Location ${index + 1}`,
        event_id: data.event_id,
        price: data.price,
        status: TicketStatus.AVAILABLE,
      }));

    await TicketModel.createMany(ticketsData);
  }

  async findByEventId(eventId: number): Promise<TicketModel[]> {
    const event = await EventModel.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    return TicketModel.findAll({ where: { event_id: eventId } });
  }

  async findById(eventId: number, ticketId: number): Promise<TicketModel | null> {
    const ticket = await TicketModel.findById(ticketId);
    
    return ticket && ticket.event_id === eventId ? ticket : null;
  }
}
