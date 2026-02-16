export interface IShipment {
    id: string;
    orderId: string;
    userId: string;
    trackingNumber: string;
    status: "pending" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "failed" | "returned";
    carrier: string; // e.g., "FedEx", "UPS", "Local Post"
    shippingAddress: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    estimatedDelivery: string; // ISO date string
    createdAt: string;
    updatedAt: string;
}