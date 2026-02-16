// jest.setup.js
require('dotenv').config({ path: '.env.test' });

jest.mock('./src/config/db', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })), // Default single response
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })), // Default insert response
      update: jest.fn(() => Promise.resolve({ data: null, error: null })), // Default update response
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })), // Default delete response
    })),
  },
}));
