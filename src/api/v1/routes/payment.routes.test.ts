import request from 'supertest';
import app from '../../../app';
import * as paymentService from '../services/payment.service';
import * as authService from '../services/auth.service';
import { IPayment } from '../../../types/payment-types';
import { IUser } from '../../../types/user-types';

// Mock the payment service
jest.mock('../services/payment.service');
// Mock the auth service
jest.mock('../services/auth.service');

const mockedPaymentService = paymentService as jest.Mocked<typeof paymentService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Payment API', () => {
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

  describe('GET /api/v1/payments', () => {
    it('should return all payments for an admin user', async () => {
      const mockPayments: IPayment[] = [
        {
          id: 'pay1',
          orderId: 'order1',
          userId: adminUser.id,
          amount: 100,
          currency: 'INR',
          status: 'completed',
          method: 'credit_card',
          paymentGateway: 'Razorpay',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedPaymentService.findAllPayments.mockResolvedValue(mockPayments);

      const res = await request(app)
        .get('/api/v1/payments')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPayments);
      expect(mockedPaymentService.findAllPayments).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/payments');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPaymentService.findAllPayments.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/payments')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/payments', () => {
    it('should create a new payment for an authenticated user', async () => {
      const newPaymentInput = {
        orderId: 'order2',
        amount: 200,
        currency: 'INR',
        method: 'credit_card',
        paymentGateway: 'Razorpay',
      };
      const createdPayment: IPayment = {
        id: 'pay2',
        userId: customerUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newPaymentInput,
      };
      mockedPaymentService.createPayment.mockResolvedValue(createdPayment);

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Cookie', [`token=${customerToken}`])
        .send(newPaymentInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdPayment);
      expect(mockedPaymentService.createPayment).toHaveBeenCalledWith(expect.objectContaining({
        userId: customerUser.id,
        status: 'pending',
        ...newPaymentInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newPaymentInput = {
        orderId: 'order2',
        amount: 200,
        currency: 'INR',
        method: 'credit_card',
        paymentGateway: 'Razorpay',
      };
      const res = await request(app)
        .post('/api/v1/payments')
        .send(newPaymentInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newPaymentInput = {
        orderId: 'order2',
        amount: 200,
        currency: 'INR',
        method: 'credit_card',
        paymentGateway: 'Razorpay',
      };
      mockedPaymentService.createPayment.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Cookie', [`token=${customerToken}`])
        .send(newPaymentInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/payments/:id', () => {
    it('should return a payment by ID for an authenticated user', async () => {
      const mockPayment: IPayment = {
        id: 'pay3',
        orderId: 'order3',
        userId: customerUser.id,
        amount: 300,
        currency: 'INR',
        status: 'completed',
        method: 'credit_card',
        paymentGateway: 'Razorpay',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedPaymentService.findPaymentById.mockResolvedValue(mockPayment);

      const res = await request(app)
        .get(`/api/v1/payments/${mockPayment.id}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPayment);
      expect(mockedPaymentService.findPaymentById).toHaveBeenCalledWith(mockPayment.id);
    });

    it('should return 404 if payment not found', async () => {
      mockedPaymentService.findPaymentById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/payments/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Payment not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/payments/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPaymentService.findPaymentById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/payments/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/payments/:id', () => {
    it('should update a payment by ID for an admin user', async () => {
      const paymentId = 'payToUpdate';
      const updateData = { status: 'refunded' };
      const updatedPayment: IPayment = {
        id: paymentId,
        orderId: 'order4',
        userId: adminUser.id,
        amount: 400,
        currency: 'INR',
        status: 'refunded',
        method: 'credit_card',
        paymentGateway: 'Razorpay',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedPaymentService.updatePayment.mockResolvedValue(updatedPayment);

      const res = await request(app)
        .put(`/api/v1/payments/${paymentId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedPayment);
      expect(mockedPaymentService.updatePayment).toHaveBeenCalledWith(paymentId, updateData);
    });

    it('should return 404 if payment to update not found', async () => {
      mockedPaymentService.updatePayment.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/payments/nonexistent')
        .set('Cookie', [`token=${adminToken}`])
        .send({ status: 'refunded' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Payment not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/payments/someid')
        .send({ status: 'refunded' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPaymentService.updatePayment.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/payments/someid')
        .set('Cookie', [`token=${adminToken}`])
        .send({ status: 'refunded' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/payments/order/:orderId', () => {
    it('should return payments by order ID for an authenticated user', async () => {
      const orderId = 'orderWithPayments';
      const mockPayments: IPayment[] = [
        {
          id: 'pay5',
          orderId: orderId,
          userId: customerUser.id,
          amount: 50,
          currency: 'INR',
          status: 'completed',
          method: 'credit_card',
          paymentGateway: 'Razorpay',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedPaymentService.findPaymentsByOrderId.mockResolvedValue(mockPayments);

      const res = await request(app)
        .get(`/api/v1/payments/order/${orderId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPayments);
      expect(mockedPaymentService.findPaymentsByOrderId).toHaveBeenCalledWith(orderId);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/payments/order/someorderid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const orderId = 'orderWithPayments';
      mockedPaymentService.findPaymentsByOrderId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get(`/api/v1/payments/order/${orderId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
