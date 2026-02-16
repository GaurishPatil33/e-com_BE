import request from 'supertest';
import app from '../../../app';
import * as shipmentService from '../services/shipment.service';
import * as authService from '../services/auth.service';
import { IShipment } from '../../../types/shipment-types';
import { IUser } from '../../../types/user-types';

jest.mock('../services/shipment.service');
jest.mock('../services/auth.service');

const mockedShipmentService = shipmentService as jest.Mocked<typeof shipmentService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Shipment API', () => {
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

  describe('GET /api/v1/shipments', () => {
    it('should return all shipments for an admin user', async () => {
      const mockShipments: IShipment[] = [
        {
          id: 'ship1',
          orderId: 'order1',
          userId: adminUser.id,
          trackingNumber: 'TN12345',
          status: 'shipped',
          carrier: 'FedEx',
          shippingAddress: { fullName: 'Admin User', phone: '123', street: '123 Admin St', city: 'City', state: 'State', postalCode: '12345', country: 'Country' },
          estimatedDelivery: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedShipmentService.findAllShipments.mockResolvedValue(mockShipments);

      const res = await request(app)
        .get('/api/v1/shipments')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockShipments);
      expect(mockedShipmentService.findAllShipments).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/shipments');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedShipmentService.findAllShipments.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/shipments')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('POST /api/v1/shipments', () => {
    it('should create a new shipment for an admin user', async () => {
      const newShipmentInput = {
        orderId: 'order2',
        trackingNumber: 'TN67890',
        carrier: 'UPS',
        shippingAddress: { fullName: 'Admin User', phone: '456', street: '456 Admin Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        estimatedDelivery: new Date().toISOString(),
      };
      const createdShipment: IShipment = {
        id: 'ship2',
        userId: adminUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newShipmentInput,
      };
      mockedShipmentService.createShipment.mockResolvedValue(createdShipment);

      const res = await request(app)
        .post('/api/v1/shipments')
        .set('Cookie', [`token=${adminToken}`])
        .send(newShipmentInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdShipment);
      expect(mockedShipmentService.createShipment).toHaveBeenCalledWith(expect.objectContaining({
        userId: adminUser.id,
        status: 'pending',
        ...newShipmentInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newShipmentInput = {
        orderId: 'order2',
        trackingNumber: 'TN67890',
        carrier: 'UPS',
        shippingAddress: { fullName: 'Admin User', phone: '456', street: '456 Admin Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        estimatedDelivery: new Date().toISOString(),
      };
      const res = await request(app)
        .post('/api/v1/shipments')
        .send(newShipmentInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newShipmentInput = {
        orderId: 'order2',
        trackingNumber: 'TN67890',
        carrier: 'UPS',
        shippingAddress: { fullName: 'Admin User', phone: '456', street: '456 Admin Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        estimatedDelivery: new Date().toISOString(),
      };
      mockedShipmentService.createShipment.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/shipments')
        .set('Cookie', [`token=${adminToken}`])
        .send(newShipmentInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('GET /api/v1/shipments/user', () => {
    it('should return shipments for the authenticated user', async () => {
      const mockUserShipments: IShipment[] = [
        {
          id: 'ship3',
          orderId: 'order3',
          userId: customerUser.id,
          trackingNumber: 'TN11223',
          status: 'in_transit',
          carrier: 'Local Post',
          shippingAddress: { fullName: 'Customer User', phone: '789', street: '789 User St', city: 'Village', state: 'State', postalCode: '98765', country: 'Country' },
          estimatedDelivery: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedShipmentService.findShipmentsByUserId.mockResolvedValue(mockUserShipments);

      const res = await request(app)
        .get('/api/v1/shipments/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUserShipments);
      expect(mockedShipmentService.findShipmentsByUserId).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/shipments/user');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedShipmentService.findShipmentsByUserId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/shipments/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('GET /api/v1/shipments/order/:orderId', () => {
    it('should return shipments by order ID for an authenticated user', async () => {
      const orderId = 'orderWithShipments';
      const mockOrderShipments: IShipment[] = [
        {
          id: 'ship4',
          orderId: orderId,
          userId: customerUser.id,
          trackingNumber: 'TN44556',
          status: 'delivered',
          carrier: 'FedEx',
          shippingAddress: { fullName: 'Customer User', phone: '101', street: '101 Order St', city: 'Town', state: 'State', postalCode: '11223', country: 'Country' },
          estimatedDelivery: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedShipmentService.findShipmentsByOrderId.mockResolvedValue(mockOrderShipments);

      const res = await request(app)
        .get(`/api/v1/shipments/order/${orderId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockOrderShipments);
      expect(mockedShipmentService.findShipmentsByOrderId).toHaveBeenCalledWith(orderId);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/shipments/order/someorderid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const orderId = 'orderWithShipments';
      mockedShipmentService.findShipmentsByOrderId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get(`/api/v1/shipments/order/${orderId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('GET /api/v1/shipments/:id', () => {
    it('should return a shipment by ID for an authenticated user', async () => {
      const mockShipment: IShipment = {
        id: 'ship5',
        orderId: 'order5',
        userId: customerUser.id,
        trackingNumber: 'TN77889',
        status: 'out_for_delivery',
        carrier: 'UPS',
        shippingAddress: { fullName: 'Customer User', phone: '223', street: '223 User St', city: 'Village', state: 'State', postalCode: '33445', country: 'Country' },
        estimatedDelivery: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedShipmentService.findShipmentById.mockResolvedValue(mockShipment);

      const res = await request(app)
        .get(`/api/v1/shipments/${mockShipment.id}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockShipment);
      expect(mockedShipmentService.findShipmentById).toHaveBeenCalledWith(mockShipment.id);
    });

    it('should return 404 if shipment not found', async () => {
      mockedShipmentService.findShipmentById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/shipments/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Shipment not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/shipments/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedShipmentService.findShipmentById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/shipments/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('PUT /api/v1/shipments/:id', () => {
    it('should update a shipment by ID for an admin user', async () => {
      const shipmentId = 'shipToUpdate';
      const updateData = { status: 'delivered' };
      const updatedShipment: IShipment = {
        id: shipmentId,
        orderId: 'order6',
        userId: adminUser.id,
        trackingNumber: 'TN99887',
        status: 'delivered',
        carrier: 'FedEx',
        shippingAddress: { fullName: 'Admin User', phone: '334', street: '334 Admin St', city: 'City', state: 'State', postalCode: '55667', country: 'Country' },
        estimatedDelivery: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedShipmentService.updateShipment.mockResolvedValue(updatedShipment);

      const res = await request(app)
        .put(`/api/v1/shipments/${shipmentId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedShipment);
      expect(mockedShipmentService.updateShipment).toHaveBeenCalledWith(shipmentId, updateData);
    });

    it('should return 404 if shipment to update not found', async () => {
      mockedShipmentService.updateShipment.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/shipments/nonexistent')
        .set('Cookie', [`token=${adminToken}`])
        .send({ status: 'delivered' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Shipment not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/shipments/someid')
        .send({ status: 'delivered' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedShipmentService.updateShipment.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/shipments/someid')
        .set('Cookie', [`token=${adminToken}`])
        .send({ status: 'delivered' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });
});
