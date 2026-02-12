import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IUser } from '../../../types/user-types'; // Assuming this interface is still relevant for type checking

// Define the table name
const TABLE_NAME = 'users';

export class UserModel {
  /**
   * Finds a user by their ID.
   * @param id The user's ID.
   * @returns A Promise that resolves to the user data or null if not found.
   */
  static async findById(id: string): Promise<IUser | null> {
    const { data, error }: PostgrestSingleResponse<IUser> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error finding user by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds a user by their email.
   * @param email The user's email.
   * @returns A Promise that resolves to the user data or null if not found.
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const { data, error }: PostgrestSingleResponse<IUser> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding user by email:', error);
      throw error;
    }
    return data;
  }

  /**
   * Creates a new user.
   * @param userData The user data to create.
   * @returns A Promise that resolves to the created user data.
   */
  static async create(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const { data, error }: PostgrestSingleResponse<IUser> = await supabase
      .from(TABLE_NAME)
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data as IUser; // Cast to IUser as it should always return a user on success
  }

  /**
   * Updates an existing user.
   * @param id The ID of the user to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated user data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null> {
    const { data, error }: PostgrestSingleResponse<IUser> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating user:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes a user by their ID.
   * @param id The ID of the user to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}