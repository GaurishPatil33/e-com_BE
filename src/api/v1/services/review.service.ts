import { ReviewModel } from '../models/review.model';
import { IReview } from '../../../types/review-types';

export const findAllReviews = async (): Promise<IReview[]> => {
    return await ReviewModel.findAll();
};

export const findReviewById = async (id: string): Promise<IReview | null> => {
    return await ReviewModel.findById(id);
};

export const findReviewsByUserId = async (userId: string): Promise<IReview[]> => {
    return await ReviewModel.findByUserId(userId);
};

export const findReviewsByProductId = async (productId: string): Promise<IReview[]> => {
    return await ReviewModel.findByProductId(productId);
};

export const createReview = async (reviewData: Omit<IReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<IReview> => {
    return await ReviewModel.create(reviewData);
};

export const updateReview = async (id: string, updates: Partial<Omit<IReview, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IReview | null> => {
    return await ReviewModel.update(id, updates);
};

export const deleteReview = async (id: string): Promise<boolean> => {
    return await ReviewModel.delete(id);
};