import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         title:
 *           type: string
 *           description: The title of the product
 *         brand:
 *           type: string
 *           description: The brand of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product
 *         discountPercentage:
 *           type: number
 *           format: float
 *           description: Discount percentage
 *         category:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: IDs of categories the product belongs to
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *         stock:
 *           type: number
 *           description: Available stock quantity
 *         rating:
 *           type: number
 *           format: float
 *           description: Average rating of the product
 *         reviews:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: IDs of reviews for this product
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the media file
 *               public_id:
 *                 type: string
 *                 description: Public ID for cloud storage
 *               type:
 *                 type: string
 *                 enum: [image, video, youtube]
 *                 description: Type of media
 *           description: Media files (images, videos) associated with the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the product was last updated
 *       example:
 *         _id: "60d0fe4f5311236168a109cc"
 *         title: "Sample Product"
 *         brand: "BrandX"
 *         price: 99.99
 *         discountPercentage: 10
 *         category: ["60d0fe4f5311236168a109cd"]
 *         description: "This is a sample product description."
 *         stock: 100
 *         rating: 4.5
 *         reviews: ["60d0fe4f5311236168a109ce"]
 *         media: [{ url: "http://example.com/image.jpg", public_id: "img1", type: "image" }]
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-01T12:00:00Z"
 *
 *     Review:
 *       type: object
 *       required:
 *         - user
 *         - product
 *         - rating
 *         - comment
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the review
 *         user:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the user who wrote the review
 *         product:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the product being reviewed
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: The rating given by the user (1-5 stars)
 *         comment:
 *           type: string
 *           description: The text content of the review
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the review was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the review was last updated
 *       example:
 *         _id: "60d0fe4f5311236168a109ce"
 *         user: "60d0fe4f5311236168a109cf"
 *         product: "60d0fe4f5311236168a109cc"
 *         rating: 5
 *         comment: "Excellent product, highly recommend!"
 *         createdAt: "2023-01-05T10:00:00Z"
 *         updatedAt: "2023-01-05T10:00:00Z"
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.route('/')
    .get(asyncHandler(getAllProducts))
    .post(asyncHandler(createProduct));

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: A single product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
    .get(asyncHandler(getProductById))
    .put(asyncHandler(updateProduct))
    .delete(asyncHandler(deleteProduct));

export default router;
