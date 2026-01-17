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
    const db = Database.getInstance();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE event_id = ?",
      [eventId],
    );

    return rows.map((row) => new TicketModel(row as TicketModel));
  }

  async findById(ticketId: number): Promise<TicketModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM tickets WHERE id = ?",
      [ticketId],
    );

    if (rows.length === 0) {
      return null;
    }

    return new TicketModel(rows[0] as TicketModel);
  }
}
