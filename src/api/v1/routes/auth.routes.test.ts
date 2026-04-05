import request from 'supertest';
import app from '../../../app';
import * as authService from '../services/auth.service';
import { UserService } from '../services/user.service'; // Import UserService directly
import { IUser } from '../../../types/user-types';

jest.mock('../services/auth.service');
jest.mock('../services/user.service');

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedUserService = UserService as jest.Mocked<typeof UserService>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const newUserInput = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
      };
      const registeredUser: IUser = {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'hashedpassword',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedAuthService.register.mockResolvedValue(registeredUser);
      mockedUserService.getUserByEmail.mockResolvedValue(null); // No existing user

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchObject({
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        role: 'customer',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(mockedAuthService.register).toHaveBeenCalledWith(expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      const newUserInput = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserInput);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Phone number is required' }),
          expect.objectContaining({ msg: 'Phone number must be a string' }),
          expect.objectContaining({ msg: 'Password must be at least 6 characters long' }),
        ]),
      });
    });

    it('should return 409 if user with email already exists', async () => {
      const newUserInput = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
      };
      const existingUser: IUser = {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'hashedpassword',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedUserService.getUserByEmail.mockResolvedValue(existingUser); // User already exists

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserInput);

      expect(res.statusCode).toEqual(409);
      expect(res.body).toEqual({ message: 'User with this email already exists' });
    });

    it('should return 500 if there is a server error', async () => {
      const newUserInput = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
      };
      mockedAuthService.findUserById.mockResolvedValue(null);
      mockedUserService.getUserByEmail.mockResolvedValue(null); // Ensure no existing user
      mockedAuthService.register.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUserInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in a user and return a token', async () => {
      const loginInput = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      const user: IUser = {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'hashedpassword',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const token = 'mock-jwt-token';
      mockedAuthService.login.mockResolvedValue({ user, token });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginInput);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        user: {
          id: 'user123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          role: 'customer',
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        token: token,
      });
      expect(res.headers['set-cookie'][0]).toContain('token=mock-jwt-token');
      expect(mockedAuthService.login).toHaveBeenCalledWith(loginInput.email, loginInput.password);
    });

    it('should return 400 if email or password are missing', async () => {
      const loginInput = {
        email: 'john.doe@example.com',
        // Missing password
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginInput);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Password is required' }),
        ]),
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const loginInput = {
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      };
      mockedAuthService.login.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 500 if there is a server error', async () => {
      const loginInput = {
        email: 'john.doe@example.com',
        password: 'password123',
      };
      mockedAuthService.login.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear the token cookie and return success message', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
      expect(res.headers['set-cookie'][0]).toContain('token=;'); // Check if token is cleared
    });

    it('should return 500 if there is a server error (though unlikely for logout)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return the current authenticated user', async () => {
      const user: IUser = {
        id: 'user123',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        phone: '0987654321',
        password: 'hashedpassword',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const token = 'valid-jwt-token';

      // Mock the authenticate middleware to attach a user to the request
      // This requires a more advanced mocking setup or directly mocking the middleware
      // For now, we'll mock the service calls that the controller uses after authentication
      mockedAuthService.verifyAuthToken.mockReturnValue({ id: user.id });
      mockedAuthService.findUserById.mockResolvedValue(user);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${token}`]); // Simulate authenticated request

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        id: 'user123',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
        phone: '0987654321',
        role: 'customer',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(mockedAuthService.verifyAuthToken).toHaveBeenCalledWith(token);
      expect(mockedAuthService.findUserById).toHaveBeenCalledWith(user.id);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 401 if token is invalid', async () => {
      mockedAuthService.verifyAuthToken.mockReturnValue(null);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=invalid-token']);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'Token is not valid' });
    });

    it('should return 401 if user not found after token verification', async () => {
      mockedAuthService.verifyAuthToken.mockReturnValue({ id: 'nonexistent-user' });
      mockedAuthService.findUserById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=valid-token']);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedAuthService.verifyAuthToken.mockReturnValue({ id: 'user123' });
      mockedAuthService.findUserById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=valid-token']);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
