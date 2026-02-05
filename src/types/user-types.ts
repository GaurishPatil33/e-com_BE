import { Document, Schema } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
    role: "customer" | "admin";
    address: Schema.Types.ObjectId[];
}

export interface IAddress extends Document {
    user: Schema.Types.ObjectId;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}
