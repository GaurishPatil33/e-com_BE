export interface IOrder {
    id: string; 
    user_id: string;
    items: {
        product_id: string; 
        title: string;
        quantity: number;
        price_at_purchase: number;
    }[];
    shipping_address: {
        full_name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    payment_status: "pending" | "paid" | "failed";
    payment_id?: string;
    order_status: "processing" | "shipped" | "delivered" | "cancelled";
    total_amount: number;
    created_at: string;
    updated_at: string;
}