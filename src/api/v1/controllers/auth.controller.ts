import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { UserService } from '../services/user.service';
import { findUserById } from '../services/auth.service';

export const registerUser = async (req: Request, res: Response) => {
    const { first_name, last_name, email, phone, password } = req.body;

    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
    }

    const newUser = await authService.register({ first_name, last_name, email, phone, password });
    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);
    if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { user, token } = result;

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;
    // res.status(200).json({ user: userWithoutPassword, token }); //geting no token err
    res.status(200).json({ user: userWithoutPassword});
};

export const logoutUser = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
    // The user object should be attached to the request by the authentication middleware
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
};
