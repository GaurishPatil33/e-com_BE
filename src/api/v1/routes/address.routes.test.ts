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
  let customer_user: IUser;
  let customer_token: string;

  beforeAll(() => {
    customer_user = {
      id: 'customer123',
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      password: 'hashedpassword', // Added password
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customer_token = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === customer_token) return { id: customer_user.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === customer_user.id) return Promise.resolve(customer_user);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/addresses/user', () => {
    it('should return all addresses for the authenticated user', async () => {
      const mockAddresses: IAddress[] = [
        {
          id: 'addr1',
          user_id: customer_user.id,
          full_name: 'Customer User',
          phone: '4445556666',
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postal_code: '12345',
          country: 'USA',
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockedAddressService.findAddressesByUserId.mockResolvedValue(mockAddresses);

      const res = await request(app)
        .get('/api/v1/addresses/user')
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockAddresses);
      expect(mockedAddressService.findAddressesByUserId).toHaveBeenCalledWith(customer_user.id);
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
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/addresses', () => {
    it('should create a new address for the authenticated user', async () => {
      const newAddressInput = {
        full_name: 'Customer User',
        phone: '4445556666',
        street: '456 Oak Ave',
        city: 'Otherville',
        state: 'NY',
        postal_code: '67890',
        country: 'USA',
        is_default: false,
      };
      const createdAddress: IAddress = {
        id: 'addr2',
        user_id: customer_user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newAddressInput,
      };
      mockedAddressService.createAddress.mockResolvedValue(createdAddress);

      const res = await request(app)
        .post('/api/v1/addresses')
        .set('Cookie', [`token=${customer_token}`])
        .send(newAddressInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdAddress);
      expect(mockedAddressService.createAddress).toHaveBeenCalledWith(expect.objectContaining({
        user_id: customer_user.id,
        ...newAddressInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newAddressInput = {
        full_name: 'Customer User',
        phone: '4445556666',
        street: '456 Oak Ave',
        city: 'Otherville',
        state: 'NY',
        postal_code: '67890',
        country: 'USA',
        is_default: false,
      };
      const res = await request(app)
        .post('/api/v1/addresses')
        .send(newAddressInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newAddressInput = {
        full_name: 'Customer User',
        phone: '4445556666',
        street: '456 Oak Ave',
        city: 'Otherville',
        state: 'NY',
        postal_code: '67890',
        country: 'USA',
        is_default: false,
      };
      mockedAddressService.createAddress.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/addresses')
        .set('Cookie', [`token=${customer_token}`])
        .send(newAddressInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/addresses/:id', () => {
    it('should return an address by ID for the authenticated user', async () => {
      const mockAddress: IAddress = {
        id: 'addr3',
        user_id: customer_user.id,
        full_name: 'Customer User',
          phone: '4445556666',
          street: '789 Pine Ln',
          city: 'Villagetown',
          state: 'GA',
          postal_code: '54321',
          country: 'USA',
          is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedAddressService.findAddressById.mockResolvedValue(mockAddress);

      const res = await request(app)
        .get(`/api/v1/addresses/${mockAddress.id}`)
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockAddress);
      expect(mockedAddressService.findAddressById).toHaveBeenCalledWith(mockAddress.id);
    });

    it('should return 404 if address not found', async () => {
      mockedAddressService.findAddressById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customer_token}`]);

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
        .set('Cookie', [`token=${customer_token}`]);

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
        user_id: customer_user.id,
        full_name: 'Customer User',
        phone: '1234567890', // Assuming a default phone for existing address
        street: '123 Main St',
        city: 'NewCity',
        state: 'CA', // Assuming a default state for existing address
        postal_code: '12345',
        country: 'USA',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedAddressService.updateAddress.mockResolvedValue(updatedAddress);

      const res = await request(app)
        .put(`/api/v1/addresses/${addressId}`)
        .set('Cookie', [`token=${customer_token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedAddress);
      expect(mockedAddressService.updateAddress).toHaveBeenCalledWith(addressId, updateData);
    });

    it('should return 404 if address to update not found', async () => {
      mockedAddressService.updateAddress.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customer_token}`])
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
        .set('Cookie', [`token=${customer_token}`])
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
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedAddressService.deleteAddress).toHaveBeenCalledWith(addressId);
    });

    it('should return 404 if address to delete not found', async () => {
      mockedAddressService.deleteAddress.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/addresses/nonexistent')
        .set('Cookie', [`token=${customer_token}`]);

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
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
