export interface IShipment {
    id: string;
    order_id: string;
    user_id: string;
    tracking_number: string;
    status: "pending" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "failed" | "returned";
    carrier: string; // e.g., "FedEx", "UPS", "Local Post"
    shipping_address: {
        full_name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    estimated_delivery: string; // ISO date string
    created_at: string;
    updated_at: string;
}