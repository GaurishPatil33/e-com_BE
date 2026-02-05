import { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    title: string;
    brand?: string;
    price: number;
    discountPercentage?: number;
    category: Schema.Types.ObjectId[];
    description?: string;
    stock?: number;
    rating?: number;
    reviews?: Schema.Types.ObjectId[];
    media: {
        url: string;
        public_id: string;
        type: "image" | "video" | "youtube";
    }[];
}
