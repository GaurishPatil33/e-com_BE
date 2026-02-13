import { ProductModel } from '../models/product.model';
import { IProduct } from '../../../types/products-types';

export const findAllProducts = async () => {
    return await ProductModel.findAll();
};

export const findProductById = async (id: string) => {
    return await ProductModel.findById(id);
};

export const createProduct = async (productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await ProductModel.create(productData);
};

export const updateProduct = async (id: string, updates: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return await ProductModel.update(id, updates);
};

export const deleteProduct = async (id: string) => {
    return await ProductModel.delete(id);
};
