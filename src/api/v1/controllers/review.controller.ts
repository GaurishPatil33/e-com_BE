import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { IReview } from '../../../types/review-types';

export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await reviewService.findAllReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error getting all reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getReviewById = async (req: Request, res: Response) => {
    try {
        const review = await reviewService.findReviewById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (error) {
        console.error('Error getting review by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const reviews = await reviewService.findReviewsByUserId(userId);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error getting reviews by user ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getReviewsByProductId = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.findReviewsByProductId(productId);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error getting reviews by product ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id; // Assuming user ID is available from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const reviewData: Omit<IReview, 'id' | 'createdAt' | 'updatedAt'> = {
            ...req.body,
            user: userId,
        };

        const newReview = await reviewService.createReview(reviewData);
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const updatedReview = await reviewService.updateReview(req.params.id, req.body);
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const deleted = await reviewService.deleteReview(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found or could not be deleted' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
