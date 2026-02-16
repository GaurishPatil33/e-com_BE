import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Custom error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    res.status(statusCode).json({
        message: message,
        // Only send stack trace in development environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
