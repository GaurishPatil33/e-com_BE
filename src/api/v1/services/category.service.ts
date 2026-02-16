import { CategoryModel } from '../models/category.model';
import { ICategory } from '../../../types/category-types';

export const findAllCategories = async (): Promise<ICategory[]> => {
    return await CategoryModel.findAll();
};

export const findCategoryById = async (id: string): Promise<ICategory | null> => {
    return await CategoryModel.findById(id);
};

export const findCategoryBySlug = async (slug: string): Promise<ICategory | null> => {
    return await CategoryModel.findBySlug(slug);
};

export const createCategory = async (categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICategory> => {
    return await CategoryModel.create(categoryData);
};

export const updateCategory = async (id: string, updates: Partial<Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICategory | null> => {
    return await CategoryModel.update(id, updates);
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    return await CategoryModel.delete(id);
};