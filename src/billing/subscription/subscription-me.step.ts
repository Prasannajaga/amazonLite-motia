import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { subscriptionService } from '../../services/SubscriptionService'

export const config: ApiRouteConfig = {
    name: 'GetMySubscription',
    type: 'api',
    path: '/subscriptions/me',
    method: 'GET',
    flows: ['subscription-flow'],
    emits: [],
    middleware: [authMiddleware],
}

export const handler: Handlers['GetMySubscription'] = async (req, { logger }) => {
    const userId = (req as any).user.id;

    logger.info('Fetching current subscription', { userId })

    try {
        const subscription = await subscriptionService.getActiveSubscriptionOrNull(userId);
        return {
            status: 200,
            body: subscription || { message: 'No active subscription found' }
        }
    } catch (error: any) {
        logger.error('Failed to fetch subscription', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to fetch subscription' }
        }
    }
}
