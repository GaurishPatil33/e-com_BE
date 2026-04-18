import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, findUserById } from '../api/v1/services/auth.service';
import { IUser } from '../types/user-types';

// Extend the Request type to include a user property
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; //getting no token err
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = verifyAuthToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Token expired or invalid' });
        }

        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(error);
    }
};


// for admin tasks 
export const requireAdmin = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Admin only access" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};