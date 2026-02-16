import dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';

dotenv.config();

// Validate environment variables
const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port({ default: 8000 }),
    SUPABASE_URL: str(),
    JWT_SECRET: str({ default: 'test-jwt-secret' }), // Ensure default for test
    SUPABASE_ANON_KEY: str({ default: 'test-supabase-anon-key' }), // Add default for test
    // Add other environment variables here as needed
});

export default env;
