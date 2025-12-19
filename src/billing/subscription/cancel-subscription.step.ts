import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { subscriptionService } from '../../services/SubscriptionService'

export const config: ApiRouteConfig = {
    name: 'CancelSubscription',
    type: 'api',
    path: '/subscriptions/:id/cancel',
    method: 'POST',
    flows: ['subscription-flow'],
    emits: ['SUBSCRIPTION_NOTIFY_FAILURE'],
    middleware: [authMiddleware],
}

export const handler: Handlers['CancelSubscription'] = async (req, { logger, emit }) => {
    const { id } = req.pathParams;
    const userId = (req as any).user.sub;

    logger.info('Cancelling subscription', { subscriptionId: id, userId });

    try {
        const subscription = await subscriptionService.cancelSubscription(id);

        if (!subscription) {
            return {
                status: 404,
                body: { error: 'Subscription not found' }
            }
        }

        await emit({
            topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
            data: {
                type: 'CANCELLATION',
                subscriptionId: subscription.id,
                userId: subscription.user_id,
                planId: subscription.plan_id,
                status: subscription.status,
                cancelledAt: subscription.cancelled_at
            }
        });

        return {
            status: 200,
            body: {
                message: 'Subscription cancelled successfully',
                subscription
            }
        }
    } catch (error: any) {
        logger.error('Failed to cancel subscription', { error: error.message });
        if (error.message.includes('not found') || error.message.includes('not active')) {
            return {
                status: 400,
                body: { error: error.message }
            }
        }
        return {
            status: 500,
            body: { error: 'Internal Server Error' }
        }
    }
}
