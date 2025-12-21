import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { reviewService } from '../../services/ReviewService'

export const config: ApiRouteConfig = {
    name: 'CreateReview',
    type: 'api',
    path: '/reviews',
    method: 'POST',
    flows: ['Reviews'],
    description: "Create a new review of an order",
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        order_id: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
    }),
}

export const handler: Handlers['CreateReview'] = async (req, { logger }) => {
    const body = req.body;
    const user = (req as any).user;

    logger.info('Creating review', { userId: user.sub, orderId: body.order_id })

    try {
        const review = await reviewService.createReview({
            user_id: user.sub,
            order_id: body.order_id,
            rating: Number(body.rating),
            comment: body.comment
        });

        return {
            status: 201,
            body: review
        }
    } catch (error: any) {
        logger.error('Review creation failed', { error: error.message });
        const statusCode = error.message.includes('Permission denied') ? 403 :
            error.message.includes('not found') ? 404 : 400;

        return {
            status: statusCode,
            body: { error: error.message }
        }
    }
}
