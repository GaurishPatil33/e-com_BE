export interface IPayment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    method: string; // e.g., "credit_card", "paypal", "razorpay"
    transactionId?: string; // ID from payment gateway
    paymentGateway?: string; // e.g., "Razorpay", "Stripe"
    createdAt: string;
    updatedAt: string;
}