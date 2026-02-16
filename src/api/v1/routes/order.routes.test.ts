import request from 'supertest';
import app from '../../../app';
import * as orderService from '../services/order.service';
import * as authService from '../services/auth.service';
import { IOrder } from '../../../types/order-types';
import { IUser } from '../../../types/user-types';

jest.mock('../services/order.service');
jest.mock('../services/auth.service');

const mockedOrderService = orderService as jest.Mocked<typeof orderService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Order API', () => {
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

  describe('GET /api/v1/orders', () => {
    it('should return all orders for an admin user', async () => {
      const mockOrders: IOrder[] = [
        {
          id: 'order1',
          userId: adminUser.id,
          items: [{ productId: 'prod1', title: 'Item 1', quantity: 1, priceAtPurchase: 10 }],
          shippingAddress: { fullName: 'Admin User', phone: '123', street: '123 Admin St', city: 'City', state: 'State', postalCode: '12345', country: 'Country' },
          paymentStatus: 'paid',
          orderStatus: 'delivered',
          totalAmount: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedOrderService.findAllOrders.mockResolvedValue(mockOrders);

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockOrders);
      expect(mockedOrderService.findAllOrders).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedOrderService.findAllOrders.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order for an authenticated user', async () => {
      const newOrderInput = {
        items: [{ productId: 'prod2', title: 'Item 2', quantity: 2, priceAtPurchase: 20 }],
        shippingAddress: { fullName: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        totalAmount: 40,
      };
      const createdOrder: IOrder = {
        id: 'newOrder1',
        userId: customerUser.id,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newOrderInput,
      };
      mockedOrderService.createOrder.mockResolvedValue(createdOrder);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`token=${customerToken}`])
        .send(newOrderInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdOrder);
      expect(mockedOrderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        userId: customerUser.id,
        paymentStatus: 'pending',
        orderStatus: 'processing',
        ...newOrderInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newOrderInput = {
        items: [{ productId: 'prod2', title: 'Item 2', quantity: 2, priceAtPurchase: 20 }],
        shippingAddress: { fullName: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        totalAmount: 40,
      };
      const res = await request(app)
        .post('/api/v1/orders')
        .send(newOrderInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newOrderInput = {
        items: [{ productId: 'prod2', title: 'Item 2', quantity: 2, priceAtPurchase: 20 }],
        shippingAddress: { fullName: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        totalAmount: 40,
      };
      mockedOrderService.createOrder.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`token=${customerToken}`])
        .send(newOrderInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('GET /api/v1/orders/user', () => {
    it('should return orders for the authenticated user', async () => {
      const mockUserOrders: IOrder[] = [
        {
          id: 'userOrder1',
          userId: customerUser.id,
          items: [{ productId: 'prod3', title: 'Item 3', quantity: 1, priceAtPurchase: 50 }],
          shippingAddress: { fullName: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
          paymentStatus: 'paid',
          orderStatus: 'processing',
          totalAmount: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedOrderService.findOrdersByUserId.mockResolvedValue(mockUserOrders);

      const res = await request(app)
        .get('/api/v1/orders/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUserOrders);
      expect(mockedOrderService.findOrdersByUserId).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/orders/user');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedOrderService.findOrdersByUserId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/orders/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return an order by ID for an authenticated user', async () => {
      const mockOrder: IOrder = {
        id: 'orderById1',
        userId: customerUser.id,
        items: [{ productId: 'prod4', title: 'Item 4', quantity: 1, priceAtPurchase: 100 }],
        shippingAddress: { fullName: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postalCode: '67890', country: 'Country' },
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        totalAmount: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedOrderService.findOrderById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get(`/api/v1/orders/${mockOrder.id}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockOrder);
      expect(mockedOrderService.findOrderById).toHaveBeenCalledWith(mockOrder.id);
    });

    it('should return 404 if order not found', async () => {
      mockedOrderService.findOrderById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Order not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/orders/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedOrderService.findOrderById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/orders/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('PUT /api/v1/orders/:id', () => {
    it('should update an order by ID for an admin user', async () => {
      const orderId = 'orderToUpdate';
      const updateData = { orderStatus: 'delivered' };
      const updatedOrder: IOrder = {
        id: orderId,
        userId: adminUser.id,
        items: [{ productId: 'prod5', title: 'Item 5', quantity: 1, priceAtPurchase: 200 }],
        shippingAddress: { fullName: 'Admin User', phone: '123', street: '123 Admin St', city: 'City', state: 'State', postalCode: '12345', country: 'Country' },
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        totalAmount: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedOrderService.updateOrder.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedOrder);
      expect(mockedOrderService.updateOrder).toHaveBeenCalledWith(orderId, updateData);
    });

    it('should return 404 if order to update not found', async () => {
      mockedOrderService.updateOrder.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${adminToken}`])
        .send({ orderStatus: 'delivered' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Order not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/orders/someid')
        .send({ orderStatus: 'delivered' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedOrderService.updateOrder.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/orders/someid')
        .set('Cookie', [`token=${adminToken}`])
        .send({ orderStatus: 'delivered' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });

  describe('DELETE /api/v1/orders/:id', () => {
    it('should delete an order by ID for an admin user', async () => {
      const orderId = 'orderToDelete';
      mockedOrderService.deleteOrder.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/orders/${orderId}`)
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedOrderService.deleteOrder).toHaveBeenCalledWith(orderId);
    });

    it('should return 404 if order to delete not found', async () => {
      mockedOrderService.deleteOrder.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Order not found or could not be deleted' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/orders/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedOrderService.deleteOrder.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/orders/someid')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
    });
  });
});
