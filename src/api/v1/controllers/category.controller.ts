import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { ICategory } from '../../../types/category-types';

export const getAllCategories = async (req: Request, res: Response) => {
    const categories = await categoryService.findAllCategories();
    res.status(200).json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
    const category = await categoryService.findCategoryById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
    const category = await categoryService.findCategoryBySlug(req.params.slug);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
};

export const createCategory = async (req: Request, res: Response) => {
    const categoryData: Omit<ICategory, 'id' | 'created_at' | 'updated_at'> = req.body;
    const newCategory = await categoryService.createCategory(categoryData);
    res.status(201).json(newCategory);
};

export const updateCategory = async (req: Request, res: Response) => {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(updatedCategory);
};

export const deleteCategory = async (req: Request, res: Response) => {
    const deleted = await categoryService.deleteCategory(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Category not found or could not be deleted' });
    }
    res.status(204).send();
};
