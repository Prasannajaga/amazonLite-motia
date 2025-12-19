import type { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
    type: 'event',
    name: 'SuccessSubscriptionNotification',
    description: 'Sends success notifications for subscription creation and renewal',
    flows: ['subscription-flow'],
    subscribes: ['SUBSCRIPTION_NOTIFY_SUCESS'],
    emits: [],
    input: z.object({
        type: z.enum(["CREATED", "RENEWAL"]),
        userId: z.string(),
        subscriptionId: z.string(),
        planId: z.string(),
        plan: z.object({
            name: z.string(),
            price: z.number(),
        }).optional(),
        startDate: z.any().optional(),
        endDate: z.any().optional(),
        status: z.any().optional(),
    }),
}

import { userModel } from '../../models/User'
import { notificationService } from '../../services/NotificationService'

export const handler: Handlers['SuccessSubscriptionNotification'] = async (input, { logger }) => {
    logger.info('Processing success subscription notification', {
        type: input.type,
        userId: input.userId,
        subscriptionId: input.subscriptionId
    });

    try {
        const user = await userModel.findById(input.userId);
        if (!user) {
            logger.error(`User ${input.userId} not found for notification`);
            return;
        }

        const data = {
            fullName: user.full_name,
            planName: input.plan?.name || null,
            subscriptionId: input.subscriptionId,
            endDate: input.endDate ? new Date(input.endDate as string).toLocaleDateString() : 'N/A'
        };

        if (input.type === 'CREATED') {
            await notificationService.sendEmail(
                user.email,
                'Subscription Created - amzLite',
                'subscription-success',
                data
            );
            logger.info(`Subscription success email sent to ${user.email}`);
        } else if (input.type === 'RENEWAL') {
            await notificationService.sendEmail(
                user.email,
                'Subscription Renewed - amzLite',
                'subscription-renewal',
                data
            );
            logger.info(`Subscription renewal email sent to ${user.email}`);
        }
    } catch (error: any) {
        logger.error('Failed to send success notification', { error: error.message });
    }
}
