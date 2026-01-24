import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { Database } from "../database.ts";

export const ReservationStatus = {
  RESERVED: "reserved",
  CANCELED: "canceled",
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus];

export class ReservationTicketModel {
  id: number;
  customer_id: number;
  ticket_id: number;
  reserved_ticket_id?: number;
  reservation_date: Date;
  status: ReservationStatus;

  constructor(data: Partial<ReservationTicketModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      customer_id: number;
      ticket_id: number;
      status: ReservationStatus;
    },
    options: { connection?: PoolConnection } = {},
  ): Promise<ReservationTicketModel> {
    const db = options.connection ?? Database.getInstance();
    const reservation_date = new Date();

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO reservation_tickets (customer_id, ticket_id, reservation_date, status)
             VALUES (?, ?, ?, ?)`,
      [data.customer_id, data.ticket_id, reservation_date, data.status],
    );

    const reservation = new ReservationTicketModel({
      ...data,
      reservation_date,
      id: result.insertId,
    });

    return reservation;
  }

  fill(data: Partial<ReservationTicketModel>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.customer_id !== undefined) this.customer_id = data.customer_id;
    if (data.ticket_id !== undefined) this.ticket_id = data.ticket_id;
    if (data.reserved_ticket_id !== undefined) this.reserved_ticket_id = data.reserved_ticket_id;
    if (data.reservation_date !== undefined)
      this.reservation_date = data.reservation_date;
    if (data.status !== undefined) this.status = data.status;
  }
}
