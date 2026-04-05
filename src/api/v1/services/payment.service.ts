import { PaymentModel } from '../models/payment.model';
import { IPayment } from '../../../types/payment-types';
import { razorpayInstance } from '../../../config/razorpay';

export const findAllPayments = async (): Promise<IPayment[]> => {
    return await PaymentModel.findAll();
};

export const findPaymentById = async (id: string): Promise<IPayment | null> => {
    return await PaymentModel.findById(id);
};

export const findPaymentsByOrderId = async (orderId: string): Promise<IPayment[]> => {
    return await PaymentModel.findByOrderId(orderId);
};

export const createPayment = async (paymentData: Omit<IPayment, 'id' | 'created_at' | 'updated_at'>): Promise<IPayment & { razorpay_order: any }> => {
    const options = {
        amount: paymentData.amount * 100,  // amount in the smallest currency unit
        currency: paymentData.currency,
        receipt: paymentData.order_id // Using orderId as receipt for now
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const payment = await PaymentModel.create({
        ...paymentData,
        razorpay_order_id: razorpayOrder.id // Save the Razorpay Order ID
    });

    return { ...payment, razorpay_order: razorpayOrder };
};

export const updatePayment = async (id: string, updates: Partial<Omit<IPayment, 'id' | 'created_at' | 'updated_at'>>): Promise<IPayment | null> => {
    return await PaymentModel.update(id, updates);
};
