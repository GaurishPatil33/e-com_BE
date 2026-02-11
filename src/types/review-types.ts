import { Document, Schema } from "mongoose";

export interface IReview extends Document {
    user: Schema.Types.ObjectId;
    product: Schema.Types.ObjectId;
    rating: number;
    comment: string;
}
