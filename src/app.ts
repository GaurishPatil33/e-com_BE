import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// routes
import productRoutes from './api/v1/routes/product.routes';
import authRoutes from './api/v1/routes/auth.routes';
import orderRoutes from './api/v1/routes/order.routes';
import paymentRoutes from './api/v1/routes/payment.routes';
import addressRoutes from './api/v1/routes/address.routes';
import categoryRoutes from './api/v1/routes/category.routes';
import reviewRoutes from './api/v1/routes/review.routes';
import postRoutes from './api/v1/routes/post.routes';
import shipmentRoutes from './api/v1/routes/shipment.routes';
import userRoutes from './api/v1/routes/user.routes';

// middlewares
import { errorHandler } from './middlewares/error.middleware';

import { API_VERSION } from './utils/constants';


const app: Application = express();

// Middlewares
app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
});

app.use(limiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use(`${API_VERSION}/products`, productRoutes);
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/orders`, orderRoutes);
app.use(`${API_VERSION}/payments`, paymentRoutes);
app.use(`${API_VERSION}/addresses`, addressRoutes);
app.use(`${API_VERSION}/categories`, categoryRoutes);
app.use(`${API_VERSION}/reviews`, reviewRoutes);
app.use(`${API_VERSION}/posts`, postRoutes);
app.use(`${API_VERSION}/shipments`, shipmentRoutes);
app.use(`${API_VERSION}/users`, userRoutes);

app.use(errorHandler);

export default app;