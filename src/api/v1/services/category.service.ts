import { CategoryModel } from '../models/category.model';
import { ICategory } from '../../../types/category-types';

export class CategoryService {
  static async getAllCategories(): Promise<ICategory[]> {
    return CategoryModel.findAll();
  }

  static async getCategoryById(id: string): Promise<ICategory | null> {
    return CategoryModel.findById(id);
  }

  static async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return CategoryModel.findBySlug(slug);
  }

  static async createCategory(categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICategory> {
    return CategoryModel.create(categoryData);
  }

  static async updateCategory(id: string, updates: Partial<Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICategory | null> {
    return CategoryModel.update(id, updates);
  }

  static async deleteCategory(id: string): Promise<boolean> {
    return CategoryModel.delete(id);
  }
}
