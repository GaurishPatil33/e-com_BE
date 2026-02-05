import { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    userId: Schema.Types.ObjectId;
    items: {
        productId: Schema.Types.ObjectId;
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
    orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
    totalAmount: number;
}
