import { supabase } from '../../../config/db';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { IPost } from '../../../types/post-types';

const TABLE_NAME = 'posts';

export class PostModel {
  /**
   * Finds all posts.
   * @returns A Promise that resolves to an array of post data.
   */
  static async findAll(): Promise<IPost[]> {
    const { data, error }: PostgrestResponse<IPost> = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Error finding all posts:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Finds a post by its ID.
   * @param id The post's ID.
   * @returns A Promise that resolves to the post data or null if not found.
   */
  static async findById(id: string): Promise<IPost | null> {
    const { data, error }: PostgrestSingleResponse<IPost> = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding post by ID:', error);
      throw error;
    }
    return data;
  }

  /**
   * Creates a new post.
   * @param postData The post data to create.
   * @returns A Promise that resolves to the created post data.
   */
  static async create(postData: Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPost> {
    const { data, error }: PostgrestSingleResponse<IPost> = await supabase
      .from(TABLE_NAME)
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }
    return data as IPost;
  }

  /**
   * Updates an existing post.
   * @param id The ID of the post to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated post data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IPost | null> {
    const { data, error }: PostgrestSingleResponse<IPost> = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating post:', error);
      throw error;
    }
    return data;
  }

  /**
   * Deletes a post by its ID.
   * @param id The ID of the post to delete.
   * @returns A Promise that resolves to true if deleted, false if not found.
   */
  static async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
    return (count || 0) > 0;
  }
}