import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { reviewService } from '../../services/ReviewService'

export const config: ApiRouteConfig = {
    name: 'DeleteReview',
    type: 'api',
    path: '/reviews/:id',
    method: 'DELETE',
    flows: ['Reviews'],
    description: "Delete a review by ID",
    emits: [],
    middleware: [authMiddleware],
}

export const handler: Handlers['DeleteReview'] = async (req, { logger }) => {
    const reviewId = req.pathParams.id;
    const user = (req as any).user;

    logger.info('Deleting review', { reviewId, userId: user.sub });

    try {
        await reviewService.deleteReview(reviewId, user.sub);

        return {
            status: 204,
            body: null
        }
    } catch (error: any) {
        logger.error('Review deletion failed', { reviewId, error: error.message });
        const statusCode = error.message.includes('Permission denied') ? 403 :
            error.message.includes('not found') ? 404 : 500;

        return {
            status: statusCode,
            body: { error: error.message }
        }
    }
}
