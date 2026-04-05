export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password?: string;
    role: "customer" | "admin";
    oauth_provider?: string;
    oauth_id?: string;
    address_ids?: string[];
    created_at: string; 
    updated_at: string; 
}

export interface IAddress {
    id: string; 
    user_id: string; 
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string; 
    updated_at: string;
}

export interface IRefreshToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: string; // TIMESTAMPTZ maps to string in TS
    revoked: boolean;
    created_at: string;
    updated_at: string;
}
