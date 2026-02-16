import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IPayment } from '../../../types/payment-types';

const TABLE_NAME = 'payments';

export class PaymentModel {
  /**
   * Finds all payments.
   * @returns A Promise that resolves to an array of payment data.
   */
  static async findAll(): Promise<IPayment[]> {
    const { data, error }: PostgrestResponse<IPayment> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all payments:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a payment by its ID.
   * @param id The payment's ID.
   * @returns A Promise that resolves to the payment data or null if not found.
   */
  static async findById(id: string): Promise<IPayment | null> {
    const { data, error }: PostgrestSingleResponse<IPayment> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding payment by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds payments by order ID.
   * @param orderId The ID of the order.
   * @returns A Promise that resolves to an array of payment data.
   */
  static async findByOrderId(orderId: string): Promise<IPayment[]> {
    const { data, error }: PostgrestResponse<IPayment> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('orderId', orderId);

    if (error) {
      console.error('Error finding payments by order ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new payment.
   * @param paymentData The payment data to create.
   * @returns A Promise that resolves to the created payment data.
   */
  static async create(paymentData: Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPayment> {
    const { data, error }: PostgrestSingleResponse<IPayment> = await supabase
      .from(TABLE_NAME)
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
    return data as IPayment;
  }

  /**
   * Updates an existing payment.
   * @param id The ID of the payment to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated payment data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IPayment | null> {
    const { data, error }: PostgrestSingleResponse<IPayment> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating payment:', error);
      throw error;
    }
    return data;
  }
}
