import request from 'supertest';
import app from '../../../app';
import { UserService } from '../services/user.service';
import * as authService from '../services/auth.service';
import { IUser } from '../../../types/user-types';

// Mock the user service
jest.mock('../services/user.service');
// Mock the auth service
jest.mock('../services/auth.service');

const mockedUserService = UserService as jest.Mocked<typeof UserService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('User API', () => {
  let adminUser: IUser;
  let customerUser: IUser;
  let adminToken: string;
  let customerToken: string;

  beforeAll(() => {
    adminUser = {
      id: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '1112223333',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customerUser = {
      id: 'customer123',
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    adminToken = 'mock-admin-token';
    customerToken = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === adminToken) return { id: adminUser.id };
      if (token === customerToken) return { id: customerUser.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === adminUser.id) return Promise.resolve(adminUser);
      if (id === customerUser.id) return Promise.resolve(customerUser);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return all users for an admin user', async () => {
      const mockUsers: IUser[] = [adminUser, customerUser];
      mockedUserService.findAllUsers.mockResolvedValue(mockUsers);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(200);
      // Exclude passwords from the expected response
      const expectedUsers = mockUsers.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      expect(res.body).toEqual(expectedUsers);
      expect(mockedUserService.findAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedUserService.findAllUsers.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/users')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return the authenticated user\'s profile', async () => {
      mockedUserService.getUserById.mockResolvedValue(customerUser);

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      const { password, ...expectedUser } = customerUser;
      expect(res.body).toEqual(expectedUser);
      expect(mockedUserService.getUserById).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 404 if user not found', async () => {
      mockedUserService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedUserService.getUserById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update the authenticated user\'s profile', async () => {
      const updateData = { firstName: 'UpdatedName' };
      const updatedUser: IUser = { ...customerUser, ...updateData };
      mockedUserService.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      const { password, ...expectedUser } = updatedUser;
      expect(res.body).toEqual(expectedUser);
      expect(mockedUserService.updateUser).toHaveBeenCalledWith(customerUser.id, updateData);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .send({ firstName: 'UpdatedName' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 404 if user not found', async () => {
      mockedUserService.updateUser.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`])
        .send({ firstName: 'UpdatedName' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedUserService.updateUser.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`])
        .send({ firstName: 'UpdatedName' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/users/profile', () => {
    it('should delete the authenticated user\'s account', async () => {
      mockedUserService.deleteUser.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedUserService.deleteUser).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/users/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 404 if user not found', async () => {
      mockedUserService.deleteUser.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'User not found or could not be deleted' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedUserService.deleteUser.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/users/profile')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
