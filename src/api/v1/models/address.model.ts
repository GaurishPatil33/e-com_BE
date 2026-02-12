import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IAddress } from '../../../types/user-types'; // Using the updated interface

// Define the table name
const TABLE_NAME = 'addresses';

export class AddressModel {
  /**
   * Finds an address by its ID.
   * @param id The address's ID.
   * @returns A Promise that resolves to the address data or null if not found.
   */
  static async findById(id: string): Promise<IAddress | null> {
    const { data, error }: PostgrestSingleResponse<IAddress> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error finding address by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds addresses by user ID.
   * @param userId The ID of the user.
   * @returns A Promise that resolves to an array of address data.
   */
  static async findByUserId(userId: string): Promise<IAddress[]> {
    const { data, error }: PostgrestResponse<IAddress> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error finding addresses by user ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new address.
   * @param addressData The address data to create.
   * @returns A Promise that resolves to the created address data.
   */
  static async create(addressData: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAddress> {
    const { data, error }: PostgrestSingleResponse<IAddress> = await supabase
      .from(TABLE_NAME)
      .insert([addressData])
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw error;
    }
    return data as IAddress;
  }

  /**
   * Updates an existing address.
   * @param id The ID of the address to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated address data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAddress | null> {
    const { data, error }: PostgrestSingleResponse<IAddress> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating address:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes an address by its ID.
   * @param id The ID of the address to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}