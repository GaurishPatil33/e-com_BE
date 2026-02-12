import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    REDIS_URL,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
} = process.env;