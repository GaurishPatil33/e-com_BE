import { model, models, Schema } from "mongoose";
import { ICategory } from "../../../types/category-types";

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },

    media: [
        {
            url: { type: String, required: true },
            public_id: { type: String, default: '' },
            type: { type: String, enum: ['image'], required: true },
        },
    ],
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Category = models.Category || model<ICategory>('Category', CategorySchema);

export default Category;
