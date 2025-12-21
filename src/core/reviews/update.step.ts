import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { reviewService } from '../../services/ReviewService'

export const config: ApiRouteConfig = {
    name: 'UpdateReview',
    type: 'api',
    path: '/reviews/:id',
    method: 'PATCH',
    flows: ['Reviews'],
    emits: [],
    description: "Update a review by ID",
    middleware: [authMiddleware],
    bodySchema: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        comment: z.string().optional(),
    }),
}

export const handler: Handlers['UpdateReview'] = async (req, { logger }) => {
    const reviewId = req.pathParams.id;
    const body = req.body;
    const user = (req as any).user;

    logger.info('Updating review', { reviewId, userId: user.sub });

    try {
        const updatedReview = await reviewService.updateReview(reviewId, user.sub, {
            rating: Number(body.rating),
            comment: body.comment
        });

        return {
            status: 200,
            body: updatedReview
        }
    } catch (error: any) {
        logger.error('Review update failed', { reviewId, error: error.message });
        const statusCode = error.message.includes('Permission denied') ? 403 :
            error.message.includes('not found') ? 404 : 400;

        return {
            status: statusCode,
            body: { error: error.message }
        }
    }
}
