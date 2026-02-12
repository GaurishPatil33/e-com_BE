export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
    role: "customer" | "admin";
    address?: string[];
    createdAt: string; 
    updatedAt: string; 
}

export interface IAddress {
    id: string; 
    user_id: string; 
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    createdAt: string; 
    updatedAt: string;
}