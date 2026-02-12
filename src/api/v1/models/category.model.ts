import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { ICategory } from '../../../types/category-types';

const TABLE_NAME = 'categories';

export class CategoryModel {
  /**
   * Finds all categories.
   * @returns A Promise that resolves to an array of category data.
   */
  static async findAll(): Promise<ICategory[]> {
    const { data, error }: PostgrestResponse<ICategory> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all categories:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a category by its ID.
   * @param id The category's ID.
   * @returns A Promise that resolves to the category data or null if not found.
   */
  static async findById(id: string): Promise<ICategory | null> {
    const { data, error }: PostgrestSingleResponse<ICategory> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding category by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds a category by its slug.
   * @param slug The category's slug.
   * @returns A Promise that resolves to the category data or null if not found.
   */
  static async findBySlug(slug: string): Promise<ICategory | null> {
    const { data, error }: PostgrestSingleResponse<ICategory> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding category by slug:', error);
      throw error;
    }
    return data;
  }

  /**
   * Creates a new category.
   * @param categoryData The category data to create.
   * @returns A Promise that resolves to the created category data.
   */
  static async create(categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICategory> {
    const { data, error }: PostgrestSingleResponse<ICategory> = await supabase
      .from(TABLE_NAME)
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    return data as ICategory;
  }

  /**
   * Updates an existing category.
   * @param id The ID of the category to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated category data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICategory | null> {
    const { data, error }: PostgrestSingleResponse<ICategory> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating category:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes a category by its ID.
   * @param id The ID of the category to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}