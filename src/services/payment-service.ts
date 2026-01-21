export class PaymentService {
    async processPayment(
        customer: {
            name: string;
            email: string;
            address: string;
            phone: string;
        },
        amount: number,
        cardToken: string
    ): Promise<number> {
        // Simula o processamento do pagamento
        return Math.random()
    }
}