import mongoose, { Schema, models } from "mongoose";
import { IUser } from "../../../types/user-types";

const userSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, default: "customer" },
        address: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    },
    {
        timestamps: true,
    }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;
