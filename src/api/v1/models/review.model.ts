import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IReview } from '../../../types/review-types';

const TABLE_NAME = 'reviews';

export class ReviewModel {
  /**
   * Finds all reviews.
   * @returns A Promise that resolves to an array of review data.
   */
  static async findAll(): Promise<IReview[]> {
    const { data, error }: PostgrestResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all reviews:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a review by its ID.
   * @param id The review's ID.
   * @returns A Promise that resolves to the review data or null if not found.
   */
  static async findById(id: string): Promise<IReview | null> {
    const { data, error }: PostgrestSingleResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding review by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Finds reviews by user ID.
   * @param userId The ID of the user.
   * @returns A Promise that resolves to an array of review data.
   */
  static async findByUserId(userId: string): Promise<IReview[]> {
    const { data, error }: PostgrestResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error finding reviews by user ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds reviews by product ID.
   * @param productId The ID of the product.
   * @returns A Promise that resolves to an array of review data.
   */
  static async findByProductId(productId: string): Promise<IReview[]> {
    const { data, error }: PostgrestResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('product_id', productId);

    if (error) {
      console.error('Error finding reviews by product ID:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Creates a new review.
   * @param reviewData The review data to create.
   * @returns A Promise that resolves to the created review data.
   */
  static async create(reviewData: Omit<IReview, 'id' | 'created_at' | 'updated_at'>): Promise<IReview> {
    const { data, error }: PostgrestSingleResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }
    return data as IReview;
  }

  /**
   * Updates an existing review.
   * @param id The ID of the review to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated review data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IReview, 'id' | 'created_at' | 'updated_at'>>): Promise<IReview | null> {
    const { data, error }: PostgrestSingleResponse<IReview> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating review:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes a review by its ID.
   * @param id The ID of the review to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}