-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'admin')),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMSTAMPTZ DEFAULT NOW()
);

-- Create the orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id),
    items JSONB,
    "shippingAddress" JSONB,
    "paymentStatus" VARCHAR(50) CHECK ("paymentStatus" IN ('pending', 'paid', 'failed')),
    "orderStatus" VARCHAR(50) CHECK ("orderStatus" IN ('processing', 'shipped', 'delivered', 'cancelled')),
    "totalAmount" NUMERIC(10, 2),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);