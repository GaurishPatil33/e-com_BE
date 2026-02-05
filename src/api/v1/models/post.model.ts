import { model, models, Schema } from "mongoose";
import { IPost } from "../../../types/post-types";

const PostSchema = new Schema<IPost>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

const Post = models.Post || model<IPost>("Post", PostSchema);

export default Post;
