import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { IOrder } from '../../../types/order-types';

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderService.findAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting all orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await orderService.findOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error getting order by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getOrdersByUserId = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const orders = await orderService.findOrdersByUserId(userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting orders by user ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const deleted = await orderService.deleteOrder(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Order not found or could not be deleted' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
