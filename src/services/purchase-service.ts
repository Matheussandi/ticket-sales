import { Database } from "../database.ts";
import { CustomerModel } from "../model/customer-model.ts";
import { PurchaseModel, PurchaseStatus } from "../model/purchase-model.ts";
import { TicketModel, TicketStatus } from "../model/ticket-model.ts";
import { PaymentService } from "./payment-service.ts";

export class PurchaseService {
  constructor(private paymentService: PaymentService) {}

  async create(data: {
    customerId: number;
    ticketIds: number[];
    cardToken: string;
  }): Promise<number> {
    const customer = await CustomerModel.findById(data.customerId, {
      user: true,
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const tikects = await TicketModel.findAll({
      where: { ids: data.ticketIds },
    });

    if (tikects.length !== data.ticketIds.length) {
      throw new Error("Some tickets not found");
    }

    if (tikects.some((ticket) => ticket.status !== TicketStatus.AVAILABLE)) {
      throw new Error("Some tickets are not available");
    }

    const amount = tikects.reduce((sum, ticket) => sum + ticket.price, 0);

    const db = Database.getInstance();
    const connection = await db.getConnection();

    let purchase: PurchaseModel;
    try {
      await connection.beginTransaction();

      purchase = await PurchaseModel.create(
        {
          customer_id: data.customerId,
          total_amount: amount,
          status: PurchaseStatus.PENDING,
        },
        { connection },
      );

      await this.associateTicketsWithPurchase(
        purchase.id, 
        data.ticketIds,
        connection,
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    try {
        await connection.beginTransaction();
        purchase.status = PurchaseStatus.PAID;
        await purchase.update({ connection });
    } catch (error) {
        purchase.status = PurchaseStatus.CANCELED;
        await purchase.update({ connection });
        throw error;
    } finally {
        connection.release();
    }

    return purchase.id;
  }

  private async associateTicketsWithPurchase(
    purchaseId: number,
    ticketIds: number[],
    connection: any,
  ): Promise<void> {
    const purchaseTickets = ticketIds.map((ticketId) => ({
      purchase_id: purchaseId,
      ticket_id: ticketId,
    }));
    await PurchaseModel.createMany(purchaseTickets, { connection });
  }

  async findById(id: number): Promise<PurchaseModel | null> {
    return PurchaseModel.findById(id);
  }
}
