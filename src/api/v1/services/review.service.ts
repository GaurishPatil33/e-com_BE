import { ReviewModel } from '../models/review.model';
import { IReview } from '../../../types/review-types';

export class ReviewService {
  static async getAllReviews(): Promise<IReview[]> {
    return ReviewModel.findAll();
  }

  static async getReviewById(id: string): Promise<IReview | null> {
    return ReviewModel.findById(id);
  }

  static async getReviewsByUserId(userId: string): Promise<IReview[]> {
    return ReviewModel.findByUserId(userId);
  }

  static async getReviewsByProductId(productId: string): Promise<IReview[]> {
    return ReviewModel.findByProductId(productId);
  }

  static async createReview(reviewData: Omit<IReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<IReview> {
    return ReviewModel.create(reviewData);
  }

  static async updateReview(id: string, updates: Partial<Omit<IReview, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IReview | null> {
    return ReviewModel.update(id, updates);
  }

  static async deleteReview(id: string): Promise<boolean> {
    return ReviewModel.delete(id);
  }
}
