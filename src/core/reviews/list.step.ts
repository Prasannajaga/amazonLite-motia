import { ApiRouteConfig, Handlers } from 'motia'
import { reviewService } from '../../services/ReviewService'
import { authMiddleware } from '../../auth/middleware/auth';

export const config: ApiRouteConfig = {
    name: 'ListReviews',
    type: 'api',
    path: '/reviews',
    method: 'GET',
    flows: ['Reviews'],
    description: "Get a list of reviews for an order",
    middleware: [authMiddleware],
    emits: [],
}

export const handler: Handlers['ListReviews'] = async (req, { logger }) => {
    const orderId = req.queryParams.order_id as string | undefined;
    const userId = req.queryParams.user_id as string | undefined;

    try {
        const reviews = await reviewService.listReviews({ order_id: orderId, user_id: userId });
        return {
            status: 200,
            body: reviews
        }
    } catch (error: any) {
        logger.error('Failed to list reviews', { error: error.message });
        return {
            status: 500,
            body: { error: 'Internal server error' }
        }
    }
}
