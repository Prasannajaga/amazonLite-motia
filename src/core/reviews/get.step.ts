import { ApiRouteConfig, Handlers } from 'motia'
import { reviewService } from '../../services/ReviewService'
import { authMiddleware } from '../../auth/middleware/auth';

export const config: ApiRouteConfig = {
    name: 'GetReview',
    type: 'api',
    path: '/reviews/:id',
    method: 'GET',
    description: "Get a review by ID",
    flows: ['Reviews'],
    middleware: [authMiddleware],
    emits: [],
}

export const handler: Handlers['GetReview'] = async (req, { logger }) => {
    const reviewId = req.pathParams.id;

    try {
        const review = await reviewService.getReview(reviewId);
        if (!review) {
            return {
                status: 404,
                body: { error: 'Review not found' }
            }
        }

        return {
            status: 200,
            body: review
        }
    } catch (error: any) {
        logger.error('Failed to get review', { reviewId, error: error.message });
        return {
            status: 500,
            body: { error: 'Internal server error' }
        }
    }
}
