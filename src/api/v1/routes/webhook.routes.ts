import { Router } from 'express';
import { razorpayWebhook } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook endpoints for third-party services
 */

/**
 * @swagger
 * /webhook/razorpay:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Webhooks]
 *     description: This endpoint receives webhook events from Razorpay.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: The name of the event.
 *               payload:
 *                 type: object
 *                 description: The payload of the event.
 *     responses:
 *       200:
 *         description: Webhook received successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *       400:
 *         description: Bad request (e.g., invalid signature).
 *       500:
 *         description: Server error.
 */
router.post('/razorpay', razorpayWebhook);

export default router;
