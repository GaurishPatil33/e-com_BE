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
    const { data, error }: PostgrestResponse<IProduct & { product_categories: { category_id: string }[] }> = await supabase
      .from(TABLE_NAME)
      .select('*, product_categories(category_id)');

    if (error) {
      console.error('Error finding all products:', error);
      throw error;
    }

    return (data || []).map(product => ({
      ...product,
      category_ids: product.product_categories.map(pc => pc.category_id),
    }));
  }

  /**
   * Finds a product by its ID.
   * @param id The product's ID.
   * @returns A Promise that resolves to the product data or null if not found.
   */
  static async findById(id: string): Promise<IProduct | null> {
    const { data, error }: PostgrestSingleResponse<IProduct & { product_categories: { category_id: string }[] }> = await supabase
      .from(TABLE_NAME)
      .select('*, product_categories(category_id)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding product by ID:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      category_ids: data.product_categories.map(pc => pc.category_id),
    };
  }

  /**
   * Finds products by category ID.
   * @param categoryId The ID of the category.
   * @returns A Promise that resolves to an array of product data.
   */
  static async findByCategoryId(categoryId: string): Promise<IProduct[]> {
    const { data, error }: PostgrestResponse<IProduct & { product_categories: { category_id: string }[] }> = await supabase
      .from('product_categories')
      .select('product_id, products(*, product_categories(category_id))')
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error finding products by category ID:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      ...item.products,
      category_ids: item.products.product_categories.map((pc: any) => pc.category_id),
    }));
  }

  /**
   * Creates a new product.
   * @param productData The product data to create.
   * @returns A Promise that resolves to the created product data.
   */
  static async create(productData: Omit<IProduct, 'id' | 'created_at' | 'updated_at' | 'category_ids'> & { category_ids?: string[] }): Promise<IProduct> {
    const { category_ids, ...productDetails } = productData;

    const { data: newProduct, error: productError }: PostgrestSingleResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .insert([productDetails])
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      throw productError;
    }

    if (category_ids && category_ids.length > 0) {
      const productCategories = category_ids.map(categoryId => ({
        product_id: newProduct.id,
        category_id: categoryId,
      }));
      const { error: categoriesError } = await supabase
        .from('product_categories')
        .insert(productCategories);

      if (categoriesError) {
        console.error('Error inserting product categories:', categoriesError);
        // Decide how to handle this error: rollback product creation or just log
        // For now, we'll just log and proceed, but a transaction might be better
      }
    }

    return { ...newProduct, category_ids: category_ids || [] } as IProduct;
  }

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.
   * @param updates The fields to update.
   * @returns A Promise that resolves to the updated product data or null if not found.
   */
  static async update(id: string, updates: Partial<Omit<IProduct, 'id' | 'created_at' | 'updated_at' | 'category_ids'>> & { category_ids?: string[] }): Promise<IProduct | null> {
    const { category_ids, ...productDetails } = updates;

    const { data: updatedProduct, error: productError }: PostgrestSingleResponse<IProduct> = await supabase
      .from(TABLE_NAME)
      .update(productDetails)
      .eq('id', id)
      .select()
      .single();

    if (productError && productError.code !== 'PGRST116') {
      console.error('Error updating product:', productError);
      throw productError;
    }

    if (!updatedProduct) {
      return null;
    }

    if (category_ids !== undefined) {
      // Delete existing product categories
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', id);

      if (deleteError) {
        console.error('Error deleting existing product categories:', deleteError);
        throw deleteError;
      }

      // Insert new product categories if provided
      if (category_ids.length > 0) {
        const productCategories = category_ids.map(categoryId => ({
          product_id: id,
          category_id: categoryId,
        }));
        const { error: insertError } = await supabase
          .from('product_categories')
          .insert(productCategories);

        if (insertError) {
          console.error('Error inserting new product categories:', insertError);
          throw insertError;
        }
      }
    }

    // Re-fetch the product with updated categories to ensure consistency
    return this.findById(id);
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