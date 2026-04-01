export interface IRazorpayOrder {
    amount: number;
    amount_due: number;
    amount_paid: number;
    attempts: number;
    created_at: number; // Unix timestamp
    currency: string;
    entity: string;
    id: string; // This is the razorpayOrderId
    notes: any[]; // Can be more specific if needed
    offer_id: string | null;
    receipt: string;
    status: string;
}

export interface IPayment {
    id: string;
    order_id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "refunded";
    method: string; // e.g., "credit_card", "paypal", "razorpay"
    transaction_id?: string; // ID from payment gateway
    payment_gateway?: string; // e.g., "Razorpay", "Stripe"
    razorpay_order_id?: string; // Razorpay Order ID (top-level)
    razorpay_order?: IRazorpayOrder; // Nested Razorpay order object
    created_at: string;
    updated_at: string;
}
