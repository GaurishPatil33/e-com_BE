import dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: port({ default: 8000 }),
  SUPABASE_URL: str(),
  JWT_SECRET: str({ default: 'test-jwt-secret' }),
  SUPABASE_ANON_KEY: str({ default: 'test-supabase-anon-key' }),
  REDIS_URL: str(),
  RAZORPAY_KEY_ID: str(),
  RAZORPAY_KEY_SECRET: str(),
  SHIPROCKET_EMAIL: str(),
  SHIPROCKET_PASSWORD: str(),
  SHIPROCKET_BASE_URL: str(),
});

export default env;
