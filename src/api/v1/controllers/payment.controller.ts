import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { IPayment } from '../../../types/payment-types';

export const getAllPayments = async (req: Request, res: Response) => {
    const payments = await paymentService.findAllPayments();
    res.status(200).json(payments);
};

export const getPaymentById = async (req: Request, res: Response) => {
    const payment = await paymentService.findPaymentById(req.params.id);
    if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
};

export const getPaymentsByOrderId = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const payments = await paymentService.findPaymentsByOrderId(orderId);
    res.status(200).json(payments);
};

export const createPayment = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const paymentData: Omit<IPayment, 'id' | 'created_at' | 'updated_at'> = {
        ...req.body,
        user_id: userId,
        status: 'pending',
        currency: req.body.currency || 'INR',
    };

    const newPayment = await paymentService.createPayment(paymentData);
    res.status(201).json(newPayment);
};

export const updatePayment = async (req: Request, res: Response) => {
    const updatedPayment = await paymentService.updatePayment(req.params.id, req.body);
    if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(updatedPayment);
};
