import { Router } from 'express';
import { getAddressById, getAddressesByUserId, createAddress, updateAddress, deleteAddress } from '../controllers/address.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: User address management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - user_id
 *         - fullName
 *         - address
 *         - city
 *         - postalCode
 *         - country
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the address
 *         user_id:
 *           type: string
 *           description: The ID of the user this address belongs to
 *         fullName:
 *           type: string
 *           description: Full name of the recipient
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         postalCode:
 *           type: string
 *           description: Postal code
 *         country:
 *           type: string
 *           description: Country
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the address was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the address was last updated
 */

/**
 * @swagger
 * /api/v1/addresses/user:
 *   get:
 *     summary: Get all addresses for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of addresses for the current user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user', asyncHandler(authenticate), asyncHandler(getAddressesByUserId));

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - address
 *               - city
 *               - postalCode
 *               - country
 *             properties:
 *               fullName:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', asyncHandler(authenticate), asyncHandler(createAddress));

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   get:
 *     summary: Get an address by ID for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The address ID
 *     responses:
 *       200:
 *         description: A single address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an address by ID for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: The updated address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an address by ID for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The address ID
 *     responses:
 *       204:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(asyncHandler(authenticate), asyncHandler(getAddressById))
    .put(asyncHandler(authenticate), asyncHandler(updateAddress))
    .delete(asyncHandler(authenticate), asyncHandler(deleteAddress));

export default router;
