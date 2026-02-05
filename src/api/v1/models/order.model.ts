import { model, models, Schema } from "mongoose";
import { IOrder } from "../../../types/order-types";

const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                title: String,
                quantity: Number,
                priceAtPurchase: Number,
            },
        ],
        shippingAddress: {
            fullName: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["processing", "shipped", "delivered", "cancelled"],
            default: "processing",
        },
        totalAmount: Number,
    },
    { timestamps: true }
);

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
