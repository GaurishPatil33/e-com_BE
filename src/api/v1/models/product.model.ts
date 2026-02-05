import { model, models, Schema } from "mongoose";
import { IProduct } from "../../../types/products-types";

const ProductSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true },
        brand: { type: String },
        price: { type: Number, required: true, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0 },
        category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
        description: { type: String },
        stock: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
        media: [
            {
                url: { type: String, required: true },
                public_id: { type: String, default: "" },
                type: { type: String, enum: ["image", "video", "youtube"], required: true },
            },
        ],
    },
    { timestamps: true }
);

const Product = models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
