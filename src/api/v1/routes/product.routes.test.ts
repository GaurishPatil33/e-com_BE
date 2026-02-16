import request from 'supertest';
import app from '../../../app';
import * as productService from "../services/product.service";
import { IProduct } from '../../../types/products-types';
jest.mock('../services/product.service');

const mockedProductService = productService as jest.Mocked<typeof productService>;

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      const mockProducts: IProduct[] = [
        { id: '1', title: 'Product 1', price: 100, category: [], media: [], createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
        { id: '2', title: 'Product 2', price: 200, category: [], media: [], createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      ];
      mockedProductService.findAllProducts.mockResolvedValue(mockProducts);

      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProducts);
      expect(mockedProductService.findAllProducts).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      mockedProductService.findAllProducts.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
      expect(mockedProductService.findAllProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a product when given a valid ID', async () => {
      const mockProduct: IProduct = { id: '123', title: 'Test Product', price: 150, category: [], media: [], createdAt: '', updatedAt: '' };
      mockedProductService.findProductById.mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/v1/products/123');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProduct);
      expect(mockedProductService.findProductById).toHaveBeenCalledWith('123');
    });

    it('should return 404 if product is not found', async () => {
      mockedProductService.findProductById.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/products/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Product not found' });
      expect(mockedProductService.findProductById).toHaveBeenCalledWith('nonexistent');
    });

    it('should return 500 if there is a server error', async () => {
      mockedProductService.findProductById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/products/123');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
      expect(mockedProductService.findProductById).toHaveBeenCalledWith('123');
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const newProductData = { title: 'New Product', price: 250 };
      const createdProduct: IProduct = { id: '456', ...newProductData, category: [], media: [], createdAt: '', updatedAt: '' };
      mockedProductService.createProduct.mockResolvedValue(createdProduct);

      const res = await request(app)
        .post('/api/v1/products')
        .send(newProductData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdProduct);
      expect(mockedProductService.createProduct).toHaveBeenCalledWith(newProductData);
    });

    it('should return 500 if there is a server error during creation', async () => {
      const newProductData = { title: 'New Product', price: 250 };
      mockedProductService.createProduct.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/products')
        .send(newProductData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
      expect(mockedProductService.createProduct).toHaveBeenCalledWith(newProductData);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update an existing product', async () => {
      const productId = '123';
      const updateData = { title: 'Updated Product', price: 160 };
      const updatedProduct: IProduct = { id: productId, ...updateData, category: [], media: [], createdAt: '', updatedAt: '' };
      mockedProductService.updateProduct.mockResolvedValue(updatedProduct);

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedProduct);
      expect(mockedProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
    });

    it('should return 404 if product to update is not found', async () => {
      const productId = 'nonexistent';
      const updateData = { title: 'Updated Product', price: 160 };
      mockedProductService.updateProduct.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Product not found' });
      expect(mockedProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
    });

    it('should return 500 if there is a server error during update', async () => {
      const productId = '123';
      const updateData = { title: 'Updated Product', price: 160 };
      mockedProductService.updateProduct.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
      expect(mockedProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product', async () => {
      const productId = '123';
      mockedProductService.deleteProduct.mockResolvedValue(true);

      const res = await request(app).delete(`/api/v1/products/${productId}`);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({}); // 204 No Content should have an empty body
      expect(mockedProductService.deleteProduct).toHaveBeenCalledWith(productId);
    });

    it('should return 404 if product to delete is not found', async () => {
      const productId = 'nonexistent';
      mockedProductService.deleteProduct.mockResolvedValue(false);

      const res = await request(app).delete(`/api/v1/products/${productId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Product not found or could not be deleted' });
      expect(mockedProductService.deleteProduct).toHaveBeenCalledWith(productId);
    });

    it('should return 500 if there is a server error during deletion', async () => {
      const productId = '123';
      mockedProductService.deleteProduct.mockRejectedValue(new Error('Database error'));

      const res = await request(app).delete(`/api/v1/products/${productId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Server Error' });
      expect(mockedProductService.deleteProduct).toHaveBeenCalledWith(productId);
    });
  });
});
