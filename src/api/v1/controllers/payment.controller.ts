import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { IPayment } from '../../../types/payment-types';

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const payments = await paymentService.findAllPayments();
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error getting all payments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const payment = await paymentService.findPaymentById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error('Error getting payment by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getPaymentsByOrderId = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const payments = await paymentService.findPaymentsByOrderId(orderId);
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error getting payments by order ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const paymentData: Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'> = {
            ...req.body,
            userId: userId,
            status: 'pending',
            currency: req.body.currency || 'INR',
        };

        const newPayment = await paymentService.createPayment(paymentData);
        res.status(201).json(newPayment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const updatedPayment = await paymentService.updatePayment(req.params.id, req.body);
        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
