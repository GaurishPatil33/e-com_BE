import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IOrder } from '../../../types/order-types';

const TABLE_NAME = 'orders';

export class OrderModel {
  /**
   * Finds all orders.
   * @returns A Promise that resolves to an array of order data.
   */
  static async findAll(): Promise<IOrder[]> {
    const { data, error }: PostgrestResponse<IOrder> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all orders:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds an order by its ID.
   * @param id The order's ID.
   * @returns A Promise that resolves to the order data or null if not found.
   */
  static async findById(id: string): Promise<IOrder | null> {
    const { data, error }: PostgrestSingleResponse<IOrder> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding order by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds orders by user ID.
   * @param userId The ID of the user.
   * @returns A Promise that resolves to an array of order data.
   */
  static async findByUserId(userId: string): Promise<IOrder[]> {
    const { data, error }: PostgrestResponse<IOrder> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error finding orders by user ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new order.
   * @param orderData The order data to create.
   * @returns A Promise that resolves to the created order data.
   */
  static async create(orderData: Omit<IOrder, 'id' | 'created_at' | 'updated_at'>): Promise<IOrder> {
    const { data, error }: PostgrestSingleResponse<IOrder> = await supabase
      .from(TABLE_NAME)
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    return data as IOrder;
  }

  /**
   * Updates an existing order.
   * @param id The ID of the order to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated order data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IOrder, 'id' | 'created_at' | 'updated_at'>>): Promise<IOrder | null> {
    const { data, error }: PostgrestSingleResponse<IOrder> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating order:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes an order by its ID.
   * @param id The ID of the order to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}