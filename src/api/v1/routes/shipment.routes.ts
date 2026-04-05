import { Router } from 'express';
import { getAllShipments, getShipmentById, getShipmentsByOrderId, getShipmentsByUserId, createShipment, updateShipment } from '../controllers/shipment.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Shipment management and tracking
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Shipment:
 *       type: object
 *       required:
 *         - order_id
 *         - user_id
 *         - tracking_number
 *         - status
 *         - carrier
 *         - shipping_address
 *         - estimated_delivery
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the shipment
 *         order_id:
 *           type: string
 *           description: The ID of the associated order
 *         user_id:
 *           type: string
 *           description: The ID of the user who owns this shipment
 *         tracking_number:
 *           type: string
 *           description: The tracking number for the shipment
 *         status:
 *           type: string
 *           enum: [pending, shipped, in_transit, out_for_delivery, delivered, failed, returned]
 *           description: Current status of the shipment
 *         carrier:
 *           type: string
 *           description: The shipping carrier (e.g., FedEx, UPS)
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
 *         estimated_delivery:
 *           type: string
 *           format: date-time
 *           description: Estimated delivery date and time
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the shipment was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the shipment was last updated
 */

/**
 * @swagger
 * /api/v1/shipments:
 *   get:
 *     summary: Get all shipments (Admin only)
 *     tags: [Shipments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of shipments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new shipment (Admin only)
 *     tags: [Shipments]
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
 *               - tracking_number
 *               - carrier
 *               - shipping_address
 *               - estimated_delivery
 *             properties:
 *               order_id:
 *                 type: string
 *               tracking_number:
 *                 type: string
 *               carrier:
 *                 type: string
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
 *               estimated_delivery:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: The created shipment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(asyncHandler(authenticate), asyncHandler(getAllShipments)) // Admin only
    .post(asyncHandler(authenticate), asyncHandler(createShipment)); // Admin only

/**
 * @swagger
 * /api/v1/shipments/user:
 *   get:
 *     summary: Get shipments for the authenticated user
 *     tags: [Shipments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of shipments for the current user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user', asyncHandler(authenticate), asyncHandler(getShipmentsByUserId));

/**
 * @swagger
 * /api/v1/shipments/order/{order_id}:
 *   get:
 *     summary: Get shipments by Order ID
 *     tags: [Shipments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Order ID
 *     responses:
 *       200:
 *         description: A list of shipments for the given order.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/order/:orderId', asyncHandler(authenticate), asyncHandler(getShipmentsByOrderId));

/**
 * @swagger
 * /api/v1/shipments/{id}:
 *   get:
 *     summary: Get a shipment by ID
 *     tags: [Shipments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: A single shipment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a shipment by ID (Admin only)
 *     tags: [Shipments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shipment'
 *     responses:
 *       200:
 *         description: The updated shipment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(asyncHandler(authenticate), asyncHandler(getShipmentById))
    .put(asyncHandler(authenticate), asyncHandler(updateShipment)); // Admin only

export default router;
