import { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { findOrderById, updateOrder } from '../services/order.service';
import env from '../../../config/env';

const handlePaymentCaptured = async (payload: any) => {
    const orderId = payload.order_id;
    const paymentId = payload.id;
    const order = await findOrderById(orderId);

    if (order) {
        await updateOrder(orderId, {
            paymentStatus: 'paid',
            paymentId: paymentId,
        });
        console.log(`Order ${orderId} marked as paid.`);
    }
};

const handlePaymentFailed = async (payload: any) => {
    const orderId = payload.order_id;
    const order = await findOrderById(orderId);

    if (order) {
        await updateOrder(orderId, {
            paymentStatus: 'failed',
        });
        console.log(`Order ${orderId} marked as payment failed.`);
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
