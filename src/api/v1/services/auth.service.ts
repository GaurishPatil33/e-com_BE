import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { IUser } from '../../../types/user-types';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Fallback for development

export const register = async (userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'address' | 'role'> & { password: string }): Promise<IUser> => {
    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({ ...rest, password: hashedPassword, role: 'customer' });
    return newUser;
};

export const login = async (email: string, password_plain: string): Promise<{ user: IUser; token: string } | null> => {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.password) {
        return null; // User not found or password not set
    }

    const isPasswordValid = await bcrypt.compare(password_plain, user.password);
    if (!isPasswordValid) {
        return null; // Invalid password
    }

    const token = generateAuthToken(user.id);
    return { user, token };
};

export const generateAuthToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyAuthToken = (token: string): { id: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded;
    } catch (error) {
        return null;
    }
};

export const findUserById = async (id: string): Promise<IUser | null> => {
    return await UserModel.findById(id);
};
