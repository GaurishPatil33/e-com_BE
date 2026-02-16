import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IShipment } from '../../../types/shipment-types';

const TABLE_NAME = 'shipments';

export class ShipmentModel {
  /**
   * Finds all shipments.
   * @returns A Promise that resolves to an array of shipment data.
   */
  static async findAll(): Promise<IShipment[]> {
    const { data, error }: PostgrestResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all shipments:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a shipment by its ID.
   * @param id The shipment's ID.
   * @returns A Promise that resolves to the shipment data or null if not found.
   */
  static async findById(id: string): Promise<IShipment | null> {
    const { data, error }: PostgrestSingleResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding shipment by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds shipments by order ID.
   * @param orderId The ID of the order.
   * @returns A Promise that resolves to an array of shipment data.
   */
  static async findByOrderId(orderId: string): Promise<IShipment[]> {
    const { data, error }: PostgrestResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('orderId', orderId);

    if (error) {
      console.error('Error finding shipments by order ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds shipments by user ID.
   * @param userId The ID of the user.
   * @returns A Promise that resolves to an array of shipment data.
   */
  static async findByUserId(userId: string): Promise<IShipment[]> {
    const { data, error }: PostgrestResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error finding shipments by user ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new shipment.
   * @param shipmentData The shipment data to create.
   * @returns A Promise that resolves to the created shipment data.
   */
  static async create(shipmentData: Omit<IShipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IShipment> {
    const { data, error }: PostgrestSingleResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .insert([shipmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
    return data as IShipment;
  }

  /**
   * Updates an existing shipment.
   * @param id The ID of the shipment to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated shipment data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IShipment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IShipment | null> {
    const { data, error }: PostgrestSingleResponse<IShipment> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating shipment:', error);
      throw error;
    }
    return data;
  }
}
