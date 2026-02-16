import { OrderModel } from '../models/order.model';
import { IOrder } from '../../../types/order-types';
export const findAllOrders = async (): Promise<IOrder[]> => {
    return await OrderModel.findAll();
};

export const findOrderById = async (id: string): Promise<IOrder | null> => {
    return await OrderModel.findById(id);
};

export const findOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
    return await OrderModel.findByUserId(userId);
};

export const createOrder = async (orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> => {
    return await OrderModel.create(orderData);
};

export const updateOrder = async (id: string, updates: Partial<Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IOrder | null> => {
    return await OrderModel.update(id, updates);
};

export const deleteOrder = async (id: string): Promise<boolean> => {
    return await OrderModel.delete(id);
};
