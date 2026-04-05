import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { IReview } from '../../../types/review-types';

export const getAllReviews = async (req: Request, res: Response) => {
    const reviews = await reviewService.findAllReviews();
    res.status(200).json(reviews);
};

export const getReviewById = async (req: Request, res: Response) => {
    const review = await reviewService.findReviewById(req.params.id);
    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const reviews = await reviewService.findReviewsByUserId(userId);
    res.status(200).json(reviews);
};

export const getReviewsByProductId = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const reviews = await reviewService.findReviewsByProductId(productId);
    res.status(200).json(reviews);
};

export const createReview = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const reviewData: Omit<IReview, 'id' | 'created_at' | 'updated_at'> = {
        ...req.body,
        user_id: userId,
    };

    const newReview = await reviewService.createReview(reviewData);
    res.status(201).json(newReview);
};

export const updateReview = async (req: Request, res: Response) => {
    const updatedReview = await reviewService.updateReview(req.params.id, req.body);
    if (!updatedReview) {
        return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(updatedReview);
};

export const deleteReview = async (req: Request, res: Response) => {
    const deleted = await reviewService.deleteReview(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Review not found or could not be deleted' });
    }
    res.status(204).send();
};
