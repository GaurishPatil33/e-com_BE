import request from 'supertest';
import app from '../../../app';
import * as categoryService from '../services/category.service';
import * as authService from '../services/auth.service';
import { ICategory } from '../../../types/category-types';
import { IUser } from '../../../types/user-types';

jest.mock('../services/category.service');
jest.mock('../services/auth.service');

const mockedCategoryService = categoryService as jest.Mocked<typeof categoryService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Category API', () => {
  let admin_user: IUser;
  let customer_user: IUser;
  let admin_token: string;
  let customer_token: string;

  beforeAll(() => {
    admin_user = {
      id: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      phone: '1112223333',
      password: 'hashedpassword',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customer_user = {
      id: 'customer123',
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      password: 'hashedpassword',
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    admin_token = 'mock-admin-token';
    customer_token = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === admin_token) return { id: admin_user.id };
      if (token === customer_token) return { id: customer_user.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === admin_user.id) return Promise.resolve(admin_user);
      if (id === customer_user.id) return Promise.resolve(customer_user);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should return all categories', async () => {
      const mockCategories: ICategory[] = [
        {
          id: 'cat1',
          name: 'Electronics',
          slug: 'electronics',
          media: [],
          parent_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockedCategoryService.findAllCategories.mockResolvedValue(mockCategories);

      const res = await request(app).get('/api/v1/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockCategories);
      expect(mockedCategoryService.findAllCategories).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      mockedCategoryService.findAllCategories.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/categories');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create a new category for an admin user', async () => {
      const newCategoryInput = {
        name: 'Books',
        slug: 'books',
        media: [],
        isActive: true,
      };
      const createdCategory: ICategory = {
        id: 'cat2',
        parent_id: null,
        is_active: newCategoryInput.isActive ? newCategoryInput.isActive : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newCategoryInput,
      };
      mockedCategoryService.createCategory.mockResolvedValue(createdCategory);

      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', [`token=${admin_token}`])
        .send(newCategoryInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdCategory);
      expect(mockedCategoryService.createCategory).toHaveBeenCalledWith(expect.objectContaining(newCategoryInput));
    });

    it('should return 401 if not authenticated', async () => {
      const newCategoryInput = {
        name: 'Books',
        slug: 'books',
        media: [],
        isActive: true,
      };
      const res = await request(app)
        .post('/api/v1/categories')
        .send(newCategoryInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newCategoryInput = {
        name: 'Books',
        slug: 'books',
        media: [],
        isActive: true,
      };
      mockedCategoryService.createCategory.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', [`token=${admin_token}`])
        .send(newCategoryInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return a category by ID', async () => {
      const mockCategory: ICategory = {
        id: 'cat3',
        name: 'Clothing',
        slug: 'clothing',
        media: [],
        parent_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedCategoryService.findCategoryById.mockResolvedValue(mockCategory);

      const res = await request(app).get(`/api/v1/categories/${mockCategory.id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockCategory);
      expect(mockedCategoryService.findCategoryById).toHaveBeenCalledWith(mockCategory.id);
    });

    it('should return 404 if category not found', async () => {
      mockedCategoryService.findCategoryById.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/categories/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Category not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedCategoryService.findCategoryById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/categories/someid');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update a category by ID for an admin user', async () => {
      const categoryId = 'catToUpdate';
      const updateData = { name: 'Updated Clothing', isActive: false };
      const updatedCategory: ICategory = {
        id: categoryId,
        name: 'Updated Clothing',
        slug: 'clothing',
        media: [],
        parent_id: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      const res = await request(app)
        .put(`/api/v1/categories/${categoryId}`)
        .set('Cookie', [`token=${admin_token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedCategory);
      expect(mockedCategoryService.updateCategory).toHaveBeenCalledWith(categoryId, updateData);
    });

    it('should return 404 if category to update not found', async () => {
      mockedCategoryService.updateCategory.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/categories/nonexistent')
        .set('Cookie', [`token=${admin_token}`])
        .send({ name: 'New Name' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Category not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/categories/someid')
        .send({ name: 'New Name' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const categoryId = 'catToUpdate';
      const updateData = { name: 'New Name' };
      mockedCategoryService.updateCategory.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/categories/someid')
        .set('Cookie', [`token=${admin_token}`])
        .send({ name: 'New Name' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete a category by ID for an admin user', async () => {
      const categoryId = 'catToDelete';
      mockedCategoryService.deleteCategory.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/categories/${categoryId}`)
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedCategoryService.deleteCategory).toHaveBeenCalledWith(categoryId);
    });

    it('should return 404 if category to delete not found', async () => {
      mockedCategoryService.deleteCategory.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/categories/nonexistent')
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Category not found or could not be deleted' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/categories/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedCategoryService.deleteCategory.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/categories/someid')
        .set('Cookie', [`token=${admin_token}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/categories/slug/:slug', () => {
    it('should return a category by slug', async () => {
      const mockCategory: ICategory = {
        id: 'cat4',
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        media: [],
        parent_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockedCategoryService.findCategoryBySlug.mockResolvedValue(mockCategory);

      const res = await request(app).get(`/api/v1/categories/slug/${mockCategory.slug}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockCategory);
      expect(mockedCategoryService.findCategoryBySlug).toHaveBeenCalledWith(mockCategory.slug);
    });

    it('should return 404 if category not found by slug', async () => {
      mockedCategoryService.findCategoryBySlug.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/categories/slug/nonexistent-slug');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Category not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedCategoryService.findCategoryBySlug.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/categories/slug/some-slug');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
