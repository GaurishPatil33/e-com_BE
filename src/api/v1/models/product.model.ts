import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IProduct } from '../../../types/products-types';

const TABLE_NAME = 'products';

export class ProductModel {
  /**
   * Finds all products.
   * @returns A Promise that resolves to an array of product data.
   */
  static async findAll(): Promise<IProduct[]> {
    const { data, error }: PostgrestResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all products:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a product by its ID.
   * @param id The product's ID.
   * @returns A Promise that resolves to the product data or null if not found.
   */
  static async findById(id: string): Promise<IProduct | null> {
    const { data, error }: PostgrestSingleResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding product by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds products by category ID.
   * @param categoryId The ID of the category.
   * @returns A Promise that resolves to an array of product data.
   */
  static async findByCategoryId(categoryId: string): Promise<IProduct[]> {
    const { data, error }: PostgrestResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .contains('category', [categoryId]); // Assuming 'category' is a JSONB array in Supabase

    if (error) {
      console.error('Error finding products by category ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new product.
   * @param productData The product data to create.
   * @returns A Promise that resolves to the created product data.
   */
  static async create(productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    const { data, error }: PostgrestSingleResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    return data as IProduct;
  }

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated product data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IProduct | null> {
    const { data, error }: PostgrestSingleResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating product:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes a product by its ID.
   * @param id The ID of the product to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}