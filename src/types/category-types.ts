import { Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    media: {
        url: string;
        public_id: string;
        type: 'image';
    }[];
    parentId: string | null;
    isActive: boolean;
}
