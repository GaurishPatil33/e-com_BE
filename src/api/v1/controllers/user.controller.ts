import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { IUser } from '../../../types/user-types';

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await UserService.findAllUsers();
    // Exclude passwords from the response
    const usersWithoutPasswords = users.map(user => {
        const { password, ...rest } = user;
        return rest;
    });
    res.status(200).json(usersWithoutPasswords);
};

export const getUserProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
};

export const updateUserProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await UserService.updateUser(userId, req.body);
    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
};

export const deleteUserAccount = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const deleted = await UserService.deleteUser(userId);
    if (!deleted) {
        return res.status(404).json({ message: 'User not found or could not be deleted' });
    }
    res.status(204).send();
};
