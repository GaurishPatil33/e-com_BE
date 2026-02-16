import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { ICategory } from '../../../types/category-types';

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.findAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting all categories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.findCategoryById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error getting category by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.findCategoryBySlug(req.params.slug);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error getting category by slug:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'> = {
            ...req.body,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true, // Default to active
        };
        const newCategory = await categoryService.createCategory(categoryData);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const deleted = await categoryService.deleteCategory(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found or could not be deleted' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
