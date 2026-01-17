import { EventModel } from "../model/event-model.ts";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;

    const event = await EventModel.create({
      name,
      description,
      date,
      location,
      partner_id: partnerId,
    });

    return {
      id: event.id,
      name,
      description,
      date,
      location,
      created_at: event.created_at,
      partner_id: event.partner_id,
    };
  }

  async findAll(partnerId?: number) {
    return await EventModel.findAll({
      where: partnerId ? { partner_id: partnerId } : undefined,
    });
  }

  async findById(eventId: number) {
    return await EventModel.findById(eventId);
  }
}
