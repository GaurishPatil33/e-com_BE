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
  let admin_user: IUser;
  let customer_user: IUser;
  let admin_token: string;
  let customer_token: string;

  beforeAll(() => {
    admin_user = {
      id: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      phone: '1112223333',
      password: 'hashedpassword',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customer_user = {
      id: 'customer123',
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      password: 'hashedpassword',
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    admin_token = 'mock-admin-token';
    customer_token = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === admin_token) return { id: admin_user.id };
      if (token === customer_token) return { id: customer_user.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === admin_user.id) return Promise.resolve(admin_user);
      if (id === customer_user.id) return Promise.resolve(customer_user);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return all orders for an admin user', async () => {
      const mockOrders: IOrder[] = [
        {
          id: 'order1',
          user_id: admin_user.id,
          items: [{ product_id: 'prod1', title: 'Item 1', quantity: 1, price_at_purchase: 10 }],
          shipping_address: { full_name: 'Admin User', phone: '123', street: '123 Admin St', city: 'City', state: 'State', postal_code: '12345', country: 'Country' },
          payment_status: 'paid',
          order_status: 'delivered',
          total_amount: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockedOrderService.findAllOrders.mockResolvedValue(mockOrders);

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Cookie', [`token=${admin_token}`]);

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
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order for an authenticated user', async () => {
      const newOrderInput = {
        items: [{ product_id: 'prod2', title: 'Item 2', quantity: 2, price_at_purchase: 20 }],
        shipping_address: { full_name: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postal_code: '67890', country: 'Country' },
        total_amount: 40,
      };
      const createdOrder: IOrder = {
        id: 'newOrder1',
        user_id: customer_user.id,
        payment_status: 'pending',
        order_status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newOrderInput,
      };
      mockedOrderService.createOrder.mockResolvedValue(createdOrder);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`token=${customer_token}`])
        .send(newOrderInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdOrder);
      expect(mockedOrderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        user_id: customer_user.id,
        payment_status: 'pending',
        order_status: 'processing',
        ...newOrderInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newOrderInput = {
        items: [{ product_id: 'prod2', title: 'Item 2', quantity: 2, price_at_purchase: 20 }],
        shipping_address: { full_name: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postal_code: '67890', country: 'Country' },
        total_amount: 40,
      };
      const res = await request(app)
        .post('/api/v1/orders')
        .send(newOrderInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newOrderInput = {
        items: [{ product_id: 'prod2', title: 'Item 2', quantity: 2, price_at_purchase: 20 }],
        shipping_address: { full_name: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postal_code: '67890', country: 'Country' },
        total_amount: 40,
      };
      mockedOrderService.createOrder.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Cookie', [`token=${customer_token}`])
        .send(newOrderInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/orders/user', () => {
    it('should return orders for the authenticated user', async () => {
      const mockUserOrders: IOrder[] = [
        {
          id: 'userOrder1',
          user_id: customer_user.id,
          items: [{ product_id: 'prod3', title: 'Item 3', quantity: 1, price_at_purchase: 50 }],
          shipping_address: { full_name: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postal_code: '67890', country: 'Country' },
          payment_status: 'paid',
          order_status: 'processing',
          total_amount: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockedOrderService.findOrdersByUserId.mockResolvedValue(mockUserOrders);

      const res = await request(app)
        .get('/api/v1/orders/user')
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUserOrders);
      expect(mockedOrderService.findOrdersByUserId).toHaveBeenCalledWith(customer_user.id);
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
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return an order by ID for an authenticated user', async () => {
      const mockOrder: IOrder = {
        id: 'orderById1',
        user_id: customer_user.id,
        items: [{ product_id: 'prod4', title: 'Item 4', quantity: 1, price_at_purchase: 100 }],
        shipping_address: { full_name: 'Customer User', phone: '456', street: '456 Customer Ave', city: 'Town', state: 'State', postal_code: '67890', country: 'Country' },
        payment_status: 'paid',
        order_status: 'shipped',
        total_amount: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedOrderService.findOrderById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get(`/api/v1/orders/${mockOrder.id}`)
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockOrder);
      expect(mockedOrderService.findOrderById).toHaveBeenCalledWith(mockOrder.id);
    });

    it('should return 404 if order not found', async () => {
      mockedOrderService.findOrderById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${customer_token}`]);

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
        .set('Cookie', [`token=${customer_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/orders/:id', () => {
    it('should update an order by ID for an admin user', async () => {
      const orderId = 'orderToUpdate';
      const updateData = { orderStatus: 'delivered' };
      const updatedOrder: IOrder = {
        id: orderId,
        user_id: admin_user.id,
        items: [{ product_id: 'prod5', title: 'Item 5', quantity: 1, price_at_purchase: 200 }],
        shipping_address: { full_name: 'Admin User', phone: '123', street: '123 Admin St', city: 'City', state: 'State', postal_code: '12345', country: 'Country' },
        payment_status: 'paid',
        order_status: 'delivered',
        total_amount: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedOrderService.updateOrder.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set('Cookie', [`token=${admin_token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedOrder);
      expect(mockedOrderService.updateOrder).toHaveBeenCalledWith(orderId, updateData);
    });

    it('should return 404 if order to update not found', async () => {
      mockedOrderService.updateOrder.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${admin_token}`])
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
        .set('Cookie', [`token=${admin_token}`])
        .send({ orderStatus: 'delivered' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/orders/:id', () => {
    it('should delete an order by ID for an admin user', async () => {
      const orderId = 'orderToDelete';
      mockedOrderService.deleteOrder.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/orders/${orderId}`)
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedOrderService.deleteOrder).toHaveBeenCalledWith(orderId);
    });

    it('should return 404 if order to delete not found', async () => {
      mockedOrderService.deleteOrder.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/orders/nonexistent')
        .set('Cookie', [`token=${admin_token}`]);

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
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
