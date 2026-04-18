import { Router } from 'express';
import { getAllPayments, getPaymentById, getPaymentsByOrderId, createPayment, updatePayment } from '../controllers/payment.controller';
import { authenticate, requireAdmin } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management and processing
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IRazorpayOrder:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         amount_due:
 *           type: number
 *         amount_paid:
 *           type: number
 *         attempts:
 *           type: number
 *         created_at:
 *           type: number
 *           description: Unix timestamp
 *         currency:
 *           type: string
 *         entity:
 *           type: string
 *         id:
 *           type: string
 *           description: Razorpay Order ID
 *         notes:
 *           type: array
 *           items:
 *             type: string
 *         offer_id:
 *           type: string
 *           nullable: true
 *         receipt:
 *           type: string
 *         status:
 *           type: string
 *     Payment:
 *       type: object
 *       required:
 *         - order_id
 *         - user_id
 *         - amount
 *         - currency
 *         - status
 *         - method
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the payment
 *         order_id:
 *           type: string
 *           description: The ID of the associated order
 *         user_id:
 *           type: string
 *           description: The ID of the user making the payment
 *         amount:
 *           type: number
 *           format: float
 *           description: The payment amount
 *         currency:
 *           type: string
 *           description: The currency of the payment (e.g., USD, INR)
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           description: Current status of the payment
 *         method:
 *           type: string
 *           description: Payment method used (e.g., credit_card, paypal)
 *         transaction_id:
 *           type: string
 *           description: Transaction ID from the payment gateway
 *         payment_gateway:
 *           type: string
 *           description: Name of the payment gateway (e.g., Razorpay, Stripe)
 *         razorpay_order_id:
 *           type: string
 *           description: Razorpay Order ID
 *         razorpay_order:
 *           $ref: '#/components/schemas/IRazorpayOrder'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the payment was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the payment was last updated
 */

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - amount
 *               - method
 *             properties:
 *               order_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               method:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created payment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(asyncHandler(authenticate),asyncHandler(requireAdmin), asyncHandler(getAllPayments)) // Admin only
    .post(asyncHandler(authenticate), asyncHandler(createPayment)); // Requires authentication

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The payment ID
 *     responses:
 *       200:
 *         description: A single payment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a payment by ID (Admin only)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       200:
 *         description: The updated payment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(asyncHandler(authenticate), asyncHandler(getPaymentById))
    .put(asyncHandler(authenticate), asyncHandler(updatePayment)); // Admin only

/**
 * @swagger
 * /api/v1/payments/order/{orderId}:
 *   get:
 *     summary: Get payments by Order ID
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The Order ID
 *     responses:
 *       200:
 *         description: A list of payments for the given order.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/order/:orderId', asyncHandler(authenticate), asyncHandler(getPaymentsByOrderId));

export default router;
