export interface IProduct {
    id: string;
    title: string;
    brand?: string;
    price: number;
    discountPercentage?: number;
    category_ids: string[];
    description?: string;
    stock?: number;
    rating?: number;
    reviews?: string[]; // Array of review IDs (strings)
    media: {
        url: string;
        public_id: string;
        type: "image" | "video" | "youtube";
    }[];
    created_at: string;
    updated_at: string;
}