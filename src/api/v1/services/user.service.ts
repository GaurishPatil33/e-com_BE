import { UserModel } from '../models/user.model';
import { IUser } from '../../../types/user-types';

export class UserService {
  static async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  static async getUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findByEmail(email);
  }

  static async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    return UserModel.create(userData);
  }

  static async updateUser(id: string, updates: Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null> {
    return UserModel.update(id, updates);
  }

  static async deleteUser(id: string): Promise<boolean> {
    return UserModel.delete(id);
  }
}
