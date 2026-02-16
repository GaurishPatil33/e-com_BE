import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, findUserById } from '../services/auth.service';
import { IUser } from '../../../types/user-types';

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
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = verifyAuthToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
