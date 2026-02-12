import { OrderModel } from '../models/order.model';
import { IOrder } from '../../../types/order-types';

export class OrderService {
  static async getAllOrders(): Promise<IOrder[]> {
    return OrderModel.findAll();
  }

  static async getOrderById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id);
  }

  static async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    return OrderModel.findByUserId(userId);
  }

  static async createOrder(orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> {
    return OrderModel.create(orderData);
  }

  static async updateOrder(id: string, updates: Partial<Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IOrder | null> {
    return OrderModel.update(id, updates);
  }

  static async deleteOrder(id: string): Promise<boolean> {
    return OrderModel.delete(id);
  }
}
