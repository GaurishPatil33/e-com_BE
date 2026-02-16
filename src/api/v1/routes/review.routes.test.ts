import request from 'supertest';
import app from '../../../app';
import * as reviewService from '../services/review.service';
import * as authService from '../services/auth.service';
import { IReview } from '../../../types/review-types';
import { IUser } from '../../../types/user-types';

// Mock the review service
jest.mock('../services/review.service');
// Mock the auth service
jest.mock('../services/auth.service');

const mockedReviewService = reviewService as jest.Mocked<typeof reviewService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Review API', () => {
  let adminUser: IUser;
  let customerUser: IUser;
  let adminToken: string;
  let customerToken: string;

  beforeAll(() => {
    adminUser = {
      id: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '1112223333',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customerUser = {
      id: 'customer123',
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    adminToken = 'mock-admin-token';
    customerToken = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === adminToken) return { id: adminUser.id };
      if (token === customerToken) return { id: customerUser.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === adminUser.id) return Promise.resolve(adminUser);
      if (id === customerUser.id) return Promise.resolve(customerUser);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/reviews', () => {
    it('should return all reviews', async () => {
      const mockReviews: IReview[] = [
        {
          id: 'rev1',
          user: customerUser.id,
          product: 'prod1',
          rating: 5,
          comment: 'Great product!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedReviewService.findAllReviews.mockResolvedValue(mockReviews);

      const res = await request(app).get('/api/v1/reviews');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockReviews);
      expect(mockedReviewService.findAllReviews).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      mockedReviewService.findAllReviews.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/reviews');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should create a new review for an authenticated user', async () => {
      const newReviewInput = {
        product: 'prod2',
        rating: 4,
        comment: 'Good value for money.',
      };
      const createdReview: IReview = {
        id: 'rev2',
        user: customerUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newReviewInput,
      };
      mockedReviewService.createReview.mockResolvedValue(createdReview);

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${customerToken}`])
        .send(newReviewInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdReview);
      expect(mockedReviewService.createReview).toHaveBeenCalledWith(expect.objectContaining({
        user: customerUser.id,
        ...newReviewInput,
      }));
    });

    it('should return 401 if not authenticated', async () => {
      const newReviewInput = {
        product: 'prod2',
        rating: 4,
        comment: 'Good value for money.',
      };
      const res = await request(app)
        .post('/api/v1/reviews')
        .send(newReviewInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newReviewInput = {
        product: 'prod2',
        rating: 4,
        comment: 'Good value for money.',
      };
      mockedReviewService.createReview.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${customerToken}`])
        .send(newReviewInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/reviews/user', () => {
    it('should return reviews by the authenticated user', async () => {
      const mockUserReviews: IReview[] = [
        {
          id: 'rev3',
          user: customerUser.id,
          product: 'prod3',
          rating: 3,
          comment: 'Average product.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedReviewService.findReviewsByUserId.mockResolvedValue(mockUserReviews);

      const res = await request(app)
        .get('/api/v1/reviews/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockUserReviews);
      expect(mockedReviewService.findReviewsByUserId).toHaveBeenCalledWith(customerUser.id);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/reviews/user');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedReviewService.findReviewsByUserId.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/v1/reviews/user')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/reviews/product/:productId', () => {
    it('should return reviews for a specific product', async () => {
      const productId = 'prod4';
      const mockProductReviews: IReview[] = [
        {
          id: 'rev4',
          user: customerUser.id,
          product: productId,
          rating: 5,
          comment: 'Excellent!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      mockedReviewService.findReviewsByProductId.mockResolvedValue(mockProductReviews);

      const res = await request(app).get(`/api/v1/reviews/product/${productId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProductReviews);
      expect(mockedReviewService.findReviewsByProductId).toHaveBeenCalledWith(productId);
    });

    it('should return 500 if there is a server error', async () => {
      const productId = 'prod4';
      mockedReviewService.findReviewsByProductId.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/v1/reviews/product/${productId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('should return a review by ID', async () => {
      const mockReview: IReview = {
        id: 'rev5',
        user: customerUser.id,
        product: 'prod5',
        rating: 4,
        comment: 'Satisfied.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedReviewService.findReviewById.mockResolvedValue(mockReview);

      const res = await request(app).get(`/api/v1/reviews/${mockReview.id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockReview);
      expect(mockedReviewService.findReviewById).toHaveBeenCalledWith(mockReview.id);
    });

    it('should return 404 if review not found', async () => {
      mockedReviewService.findReviewById.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/reviews/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Review not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedReviewService.findReviewById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/reviews/someid');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/reviews/:id', () => {
    it('should update a review by ID for the authenticated user', async () => {
      const reviewId = 'revToUpdate';
      const updateData = { comment: 'Updated comment.', rating: 5 };
      const updatedReview: IReview = {
        id: reviewId,
        user: customerUser.id,
        product: 'prod6',
        rating: 5,
        comment: 'Updated comment.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockedReviewService.updateReview.mockResolvedValue(updatedReview);

      const res = await request(app)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('Cookie', [`token=${customerToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedReview);
      expect(mockedReviewService.updateReview).toHaveBeenCalledWith(reviewId, updateData);
    });

    it('should return 404 if review to update not found', async () => {
      mockedReviewService.updateReview.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/reviews/nonexistent')
        .set('Cookie', [`token=${customerToken}`])
        .send({ comment: 'New comment' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Review not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/reviews/someid')
        .send({ comment: 'New comment' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedReviewService.updateReview.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/reviews/someid')
        .set('Cookie', [`token=${customerToken}`])
        .send({ comment: 'New comment' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/reviews/:id', () => {
    it('should delete a review by ID for the authenticated user', async () => {
      const reviewId = 'revToDelete';
      mockedReviewService.deleteReview.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedReviewService.deleteReview).toHaveBeenCalledWith(reviewId);
    });

    it('should return 404 if review to delete not found', async () => {
      mockedReviewService.deleteReview.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/reviews/nonexistent')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Review not found or could not be deleted' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/reviews/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedReviewService.deleteReview.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/reviews/someid')
        .set('Cookie', [`token=${customerToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
