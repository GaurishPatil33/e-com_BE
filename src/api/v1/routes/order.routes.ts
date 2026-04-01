import { Router } from 'express';
import { getAllOrders, getOrderById, getOrdersByUserId, createOrder, updateOrder, deleteOrder } from '../controllers/order.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user_id
 *         - items
 *         - shipping_address
 *         - payment_status
 *         - order_status
 *         - total_amount
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the order
 *         user_id:
 *           type: string
 *           description: The ID of the user who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               title:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price_at_purchase:
 *                 type: number
 *           description: List of products in the order
 *         shipping_address:
 *           type: object
 *           properties:
 *             full_name:
 *               type: string
 *             phone:
 *               type: string
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             postal_code:
 *               type: string
 *             country:
 *               type: string
 *           description: Shipping address details
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, failed]
 *           description: Current payment status of the order
 *         payment_id:
 *           type: string
 *           description: The ID of the associated payment
 *         order_status:
 *           type: string
 *           enum: [processing, shipped, delivered, cancelled]
 *           description: Current fulfillment status of the order
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Total amount of the order
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the order was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the order was last updated
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - totalAmount
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price_at_purchase:
 *                       type: number
 *               shipping_address:
 *                 type: object
 *                 properties:
 *                   full_name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postal_code:
 *                     type: string
 *                   country:
 *                     type: string
 *               total_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: The created order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(asyncHandler(authenticate), asyncHandler(getAllOrders)) // Admin only, requires authentication
    .post(asyncHandler(authenticate), asyncHandler(createOrder)); // Requires authentication

/**
 * @swagger
 * /api/v1/orders/user:
 *   get:
 *     summary: Get orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of orders for the current user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user', asyncHandler(authenticate), asyncHandler(getOrdersByUserId));

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: A single order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(asyncHandler(authenticate), asyncHandler(getOrderById))
    .put(asyncHandler(authenticate), asyncHandler(updateOrder)) // Admin only
    .delete(asyncHandler(authenticate), asyncHandler(deleteOrder)); // Admin only

export default router;
