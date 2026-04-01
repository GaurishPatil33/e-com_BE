export interface IOrder {
    id: string; 
    userId: string;
    items: {
        productId: string; 
        title: string;
        quantity: number;
        priceAtPurchase: number;
    }[];
    shippingAddress: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentStatus: "pending" | "paid" | "failed";
    paymentId?: string;
    orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}