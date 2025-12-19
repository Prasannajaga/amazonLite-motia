import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { subscriptionService } from '../../services/SubscriptionService'

export const config: ApiRouteConfig = {
    name: 'CreateSubscription',
    type: 'api',
    path: '/subscriptions',
    method: 'POST',
    flows: ['subscription-flow'],
    emits: ['SUBSCRIPTION_NOTIFY_SUCESS'],
    middleware: [authMiddleware],
    bodySchema: z.object({
        plan_id: z.string().uuid(),
    })
}

import { stripeService } from '../../services/StripeService'
import { planService } from '../../services/PlanService'

export const handler: Handlers['CreateSubscription'] = async (req, { logger, emit }) => {
    const { plan_id } = req.body;
    const userId = (req as any).user.sub;
    logger.info('Creating subscription flow', { userId, plan_id })

    try {
        const plan = await planService.getPlan(plan_id);
        if (!plan) {
            return {
                status: 404,
                body: { error: 'Plan not found' }
            }
        }

        const subscription = await subscriptionService.createSubscription(userId, plan_id);

        const paymentIntent = await stripeService.createPaymentIntent(plan.price, {
            subscription_id: subscription.id,
            user_id: userId,
            plan_id: plan_id
        });

        await emit({
            topic: 'SUBSCRIPTION_NOTIFY_SUCESS',
            data: {
                type: 'CREATED',
                subscriptionId: subscription.id,
                userId: subscription.user_id,
                planId: subscription.plan_id,
                plan: plan,
                status: subscription.status
            }
        });

        return {
            status: 201,
            body: {
                subscription_id: subscription.id,
                payment_client_secret: paymentIntent.client_secret
            }
        }
    } catch (error: any) {
        logger.error('Failed to initiate subscription', { error: error.message });
        return {
            status: 500,
            body: { error: 'Internal Server Error' }
        }
    }
}
