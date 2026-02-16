import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { IOrder } from '../../../types/order-types';

export const getAllOrders = async (req: Request, res: Response) => {
    const orders = await orderService.findAllOrders();
    res.status(200).json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
};

export const getOrdersByUserId = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const orders = await orderService.findOrdersByUserId(userId);
    res.status(200).json(orders);
};

export const createOrder = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'> = {
        ...req.body,
        userId: userId,
        paymentStatus: 'pending', // Default status
        orderStatus: 'processing', // Default status
    };

    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
};

export const updateOrder = async (req: Request, res: Response) => {
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
    if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response) => {
    const deleted = await orderService.deleteOrder(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Order not found or could not be deleted' });
    }
    res.status(204).send();
};
