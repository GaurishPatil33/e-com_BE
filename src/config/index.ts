import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    REDIS_URL,
} = process.env;