import { PaymentModel } from '../models/payment.model';
import { IPayment } from '../../../types/payment-types';

export const findAllPayments = async (): Promise<IPayment[]> => {
    return await PaymentModel.findAll();
};

export const findPaymentById = async (id: string): Promise<IPayment | null> => {
    return await PaymentModel.findById(id);
};

export const findPaymentsByOrderId = async (orderId: string): Promise<IPayment[]> => {
    return await PaymentModel.findByOrderId(orderId);
};

export const createPayment = async (paymentData: Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPayment> => {
    return await PaymentModel.create(paymentData);
};

export const updatePayment = async (id: string, updates: Partial<Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IPayment | null> => {
    return await PaymentModel.update(id, updates);
};
