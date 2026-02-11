import { model, models, Schema } from "mongoose";
import { IReview } from "../../../types/review-types";

const ReviewSchema = new Schema<IReview>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

const Review = models.Review || model<IReview>("Review", ReviewSchema);

export default Review;
