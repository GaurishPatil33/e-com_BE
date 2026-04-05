import { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { findOrderById, updateOrder } from '../services/order.service';
import { PaymentModel } from '../models/payment.model'; // Import PaymentModel
import env from '../../../config/env';

const handlePaymentCaptured = async (payload: any) => {
    const razorpayOrderId = payload.order_id;
    const paymentId = payload.id;

    // Find the payment record using razorpayOrderId
    const paymentRecord = await PaymentModel.findByRazorpayOrderId(razorpayOrderId);

    if (paymentRecord) {
        const order_id = paymentRecord.order_id;
        await updateOrder(order_id, {
            payment_status: 'paid',
            payment_id: paymentId,
        });
        // Also update the payment record itself
        await PaymentModel.update(paymentRecord.id, {
            status: 'completed',
            transaction_id: paymentId,
            payment_gateway: 'Razorpay'
        });
        console.log(`Order ${order_id} marked as paid.`);
    } else {
        console.error(`Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
    }
};

const handlePaymentFailed = async (payload: any) => {
    const razorpayOrderId = payload.order_id;

    // Find the payment record using razorpayOrderId
    const paymentRecord = await PaymentModel.findByRazorpayOrderId(razorpayOrderId);

    if (paymentRecord) {
        const order_id = paymentRecord.order_id;
        await updateOrder(order_id, {
            payment_status: 'failed',
        });
        // Also update the payment record itself
        await PaymentModel.update(paymentRecord.id, {
            status: 'failed',
            transaction_id: payload.id, // Razorpay payment ID for failed transaction
            payment_gateway: 'Razorpay'
        });
        console.log(`Order ${order_id} marked as payment failed.`);
    } else {
        console.error(`Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
    }
};

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
        return res.status(400).json({ message: 'Signature not found' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    switch (event) {
        case 'payment.captured':
            await handlePaymentCaptured(payload);
            break;
        case 'payment.failed':
            await handlePaymentFailed(payload);
            break;
        default:
            console.log(`Unhandled Razorpay event: ${event}`);
    }

    res.status(200).json({ status: 'ok' });
});
