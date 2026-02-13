import { Request, Response } from 'express';
import * as productService from '../services/product.service';

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.findAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await productService.findProductById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        if (!updatedProduct) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Product not found or could not be deleted' });
            return;
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
