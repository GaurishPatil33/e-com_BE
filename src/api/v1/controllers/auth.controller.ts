import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { findUserById } from '../services/auth.service';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await authService.findUserById(email); // Assuming findUserById can also find by email
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const newUser = await authService.register({ firstName, lastName, email, phone, password });
        // Exclude password from the response
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await authService.login(email, password);
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { user, token } = result;

        // Set token in a httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
        });

        // Exclude password from the response
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
