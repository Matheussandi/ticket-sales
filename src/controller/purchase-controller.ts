import { Request, Response, Router } from "express";
import { CustomerService } from "../services/customer-service.ts";
import { PaymentService } from "../services/payment-service.ts";
import { PurchaseService } from "../services/purchase-service.ts";

export const purchaseRouter = Router();

purchaseRouter.post("/", async (req: Request, res: Response) => {
    const customerService = new CustomerService();
    const customer = await customerService.findByUserId(req.body.userId);

    if (!customer) {
        return res.status(400).json({ error: "User needs to be a customer to make a purchase" });
    }

    const { ticketIds, cardToken } = req.body;

    const paymentService = new PaymentService();
    const purchaseService = new PurchaseService(paymentService);
    const newPurchaseId = await purchaseService.create({
        customerId: customer.id,
        ticketIds,
        cardToken,
    });

    const purchase = await purchaseService.findById(newPurchaseId);

    return res.status(201).json(purchase);
});