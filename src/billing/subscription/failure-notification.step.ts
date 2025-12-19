import type { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
    type: 'event',
    name: 'FailureSubscriptionNotification',
    description: 'Sends failure or termination notifications for subscriptions',
    flows: ['subscription-flow'],
    subscribes: ['SUBSCRIPTION_NOTIFY_FAILURE'],
    emits: [],
    input: z.object({
        type: z.enum(["CANCELLATION", "PAYMENT_FAILURE", "EXPIRY"]),
        userId: z.string(),
        subscriptionId: z.string(),
        planId: z.string(),
        status: z.any().optional(),
        cancelledAt: z.any().optional()
    }),
}

export const handler: Handlers['FailureSubscriptionNotification'] = async (input, { logger }) => {
    logger.info('Processing failure subscription notification', {
        type: input.type,
        userId: input.userId,
        subscriptionId: input.subscriptionId
    });

    // Handle notifications based on type (CANCELLATION, PAYMENT_FAILURE, EXPIRY)
    switch (input.type) {
        case 'CANCELLATION':
            logger.info(`Subscription ${input.subscriptionId} cancelled for user ${input.userId}`);
            break;
        case 'PAYMENT_FAILURE':
            logger.info(`Payment failed for subscription ${input.subscriptionId} of user ${input.userId}`);
            break;
        case 'EXPIRY':
            logger.info(`Subscription ${input.subscriptionId} expired for user ${input.userId}`);
            break;
    }
}
