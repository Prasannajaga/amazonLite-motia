import { reviewModel, ReviewEntity } from '../models/Review';
import { orderModel } from '../models/Order';

/**
 * ReviewService handles the business logic for product reviews.
 * It provides methods for creating, retrieving, listing, updating, and deleting reviews,
 * while ensuring proper authorization and data validation (e.g., verifying order ownership).
 */
export class ReviewService {
    async createReview(params: {
        user_id: string;
        order_id: string;
        rating: number;
        comment?: string;
    }): Promise<ReviewEntity> {
        // 1. Verify order ownership and status
        const order = await orderModel.findById(params.order_id);
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.user_id !== params.user_id) {
            throw new Error('Permission denied: You can only review your own orders');
        }

        // Optional: Check if order is completed
        // if (order.order_status !== 'completed') {
        //     throw new Error('You can only review completed orders');
        // }

        // 2. Check for duplicate review
        const existing = await reviewModel.findByUserAndOrder(params.user_id, params.order_id);
        if (existing) {
            throw new Error('Review already exists for this order');
        }

        return reviewModel.create({
            user_id: params.user_id,
            order_id: params.order_id,
            rating: params.rating,
            comment: params.comment || null
        });
    }

    async getReview(id: string): Promise<ReviewEntity | null> {
        return reviewModel.findById(id);
    }

    async listReviews(filters: { order_id?: string; user_id?: string } = {}): Promise<ReviewEntity[]> {
        if (filters.order_id) {
            return reviewModel.findByOrderId(filters.order_id);
        }
        // Basic list logic, ideally would be paginated
        return reviewModel.findAll();
    }

    async updateReview(id: string, userId: string, update: { rating?: number; comment?: string }): Promise<ReviewEntity> {
        const review = await reviewModel.findById(id);

        if (!review) {
            throw new Error('Review not found');
        }

        if (review.user_id !== userId) {
            throw new Error('Permission denied: You can only update your own reviews');
        }

        const updated = await reviewModel.update(id, {
            ...update,
            updated_at: new Date()
        });

        if (!updated) {
            throw new Error('Failed to update review');
        }

        return updated;
    }

    async deleteReview(id: string, userId: string): Promise<void> {
        const review = await reviewModel.findById(id);
        if (!review) {
            throw new Error('Review not found');
        }
        if (review.user_id !== userId) {
            throw new Error('Permission denied: You can only delete your own reviews');
        }

        const success = await reviewModel.delete(id);
        if (!success) {
            throw new Error('Failed to delete review');
        }
    }
}

export const reviewService = new ReviewService();
