export interface IProduct {
    id: string;
    title: string;
    brand?: string;
    price: number;
    discount_percentage?: number;
    category_ids: string[];
    description?: string;
    stock_quantity: number;
    average_rating?: number;
    images: string[];
    review_ids?: string[]; // To track associated review IDs at the application level
    created_at: string;
    updated_at: string;
}

export interface IProductCategory {
    product_id: string;
    category_id: string;
    created_at: string;
    updated_at: string;
}
