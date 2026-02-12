import { ProductModel } from '../models/product.model';
import { IProduct } from '../../../types/products-types';

export class ProductService {
  static async getAllProducts(): Promise<IProduct[]> {
    return ProductModel.findAll();
  }

  static async getProductById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id);
  }

  static async getProductsByCategoryId(categoryId: string): Promise<IProduct[]> {
    return ProductModel.findByCategoryId(categoryId);
  }

  static async createProduct(productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProduct> {
    return ProductModel.create(productData);
  }

  static async updateProduct(id: string, updates: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IProduct | null> {
    return ProductModel.update(id, updates);
  }

  static async deleteProduct(id: string): Promise<boolean> {
    return ProductModel.delete(id);
  }
}
