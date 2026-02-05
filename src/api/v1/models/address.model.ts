import mongoose, { Schema, models } from "mongoose";
import { IAddress } from "../../../types/user-types";

const addressSchema = new Schema<IAddress>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        fullName: { type: String },
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },
    {
        timestamps: true,
    }
);

const Address = models.Address || mongoose.model("Address", addressSchema);

export default Address;
