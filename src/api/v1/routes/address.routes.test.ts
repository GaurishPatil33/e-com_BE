import request from 'supertest';
import app from '../../../app';
import * as addressService from '../services/address.service';
import * as authService from '../services/auth.service';
import { IAddress, IUser } from '../../../types/user-types';

// Mock the address service
jest.mock('../services/address.service');
// Mock the auth service
jest.mock('../services/auth.service');

const mockedAddressService = addressService as jest.Mocked<typeof addressService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Address API', () => {
  let customerUser: IUser;
  let customerToken: string;

  beforeAll(() => {
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
    customerToken = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === customerToken) return { id: customerUser.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === customerUser.id) return Promise.resolve(customerUser);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/addresses/user', () => {
    it('should return all addresses for the authenticated user', async () => {
      const mockAddresses: IAddress[] = [
        {
          id: 'addr1',
          user_id: customerUser.id,
          fullName: 'Customer User',
          address: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
          country: 'USA',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedAddressService.findAddressesByUserId.mockResolvedValue(mockAddresses);

      const res = await request(app)
        .get('/api/v1/addresses/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockAddresses);
      expect(mockedAddressService.findAddressesByUserId).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/addresses/user');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedAddressService.findAddressesByUserId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/addresses/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/addresses', () => {
    it('should create a new address for the authenticated user', async () => {
      const newAddressInput = {
        fullName: 'Customer User',
        address: '456 Oak Ave',
        city: 'Otherville',
        postalCode: '67890',
        country: 'USA',
      };
      const createdAddress: IAddress = {
        id: 'addr2',
        user_id: customerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newAddressInput,
      };
      mockedAddressService.createAddress.mockResolvedValue(createdAddress);

      const res = await request(app)
        .post('/api/v1/addresses')
        .set('Cookie', [`token=${customerToken}`])
        .send(newAddressInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdAddress);
      expect(mockedAddressService.createAddress).toHaveBeenCalledWith(expect.objectContaining({
        user_id: customerUser.id,
        ...newAddressInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newAddressInput = {
        fullName: 'Customer User',
        address: '456 Oak Ave',
        city: 'Otherville',
        postalCode: '67890',
        country: 'USA',
      };
      const res = await request(app)
        .post('/api/v1/addresses')
        .send(newAddressInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newAddressInput = {
        fullName: 'Customer User',
        address: '456 Oak Ave',
        city: 'Otherville',
        postalCode: '67890',
        country: 'USA',
      };
      mockedAddressService.createAddress.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/addresses')
        .set('Cookie', [`token=${customerToken}`])
        .send(newAddressInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/addresses/:id', () => {
    it('should return an address by ID for the authenticated user', async () => {
      const mockAddress: IAddress = {
        id: 'addr3',
        user_id: customerUser.id,
        fullName: 'Customer User',
        address: '789 Pine Ln',
        city: 'Villagetown',
        postalCode: '54321',
        country: 'USA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedAddressService.findAddressById.mockResolvedValue(mockAddress);

      const res = await request(app)
        .get(`/api/v1/addresses/${mockAddress.id}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockAddress);
      expect(mockedAddressService.findAddressById).toHaveBeenCalledWith(mockAddress.id);
    });

    it('should return 404 if address not found', async () => {
      mockedAddressService.findAddressById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Address not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/addresses/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedAddressService.findAddressById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/addresses/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/addresses/:id', () => {
    it('should update an address by ID for the authenticated user', async () => {
      const addressId = 'addrToUpdate';
      const updateData = { city: 'NewCity' };
      const updatedAddress: IAddress = {
        id: addressId,
        user_id: customerUser.id,
        fullName: 'Customer User',
        address: '123 Main St',
        city: 'NewCity',
        postalCode: '12345',
        country: 'USA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedAddressService.updateAddress.mockResolvedValue(updatedAddress);

      const res = await request(app)
        .put(`/api/v1/addresses/${addressId}`)
        .set('Cookie', [`token=${customerToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedAddress);
      expect(mockedAddressService.updateAddress).toHaveBeenCalledWith(addressId, updateData);
    });

    it('should return 404 if address to update not found', async () => {
      mockedAddressService.updateAddress.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customerToken}`])
        .send({ city: 'NewCity' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Address not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/addresses/someid')
        .send({ city: 'NewCity' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedAddressService.updateAddress.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/addresses/someid')
        .set('Cookie', [`token=${customerToken}`])
        .send({ city: 'NewCity' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/addresses/:id', () => {
    it('should delete an address by ID for the authenticated user', async () => {
      const addressId = 'addrToDelete';
      mockedAddressService.deleteAddress.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/addresses/${addressId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedAddressService.deleteAddress).toHaveBeenCalledWith(addressId);
    });

    it('should return 404 if address to delete not found', async () => {
      mockedAddressService.deleteAddress.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Address not found or could not be deleted' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/addresses/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedAddressService.deleteAddress.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/addresses/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
