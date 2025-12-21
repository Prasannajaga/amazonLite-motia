import type { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { userModel } from '../../models/User'
import { emailService } from '../../services/EmailService'

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
    infrastructure: {
        handler: {
            timeout: 60,
        },
        queue: {
            maxRetries: 3,
            delaySeconds: 60,
        }
    }
}

export const handler: Handlers['FailureSubscriptionNotification'] = async (input, { logger }) => {
    logger.info('Processing failure subscription notification', {
        type: input.type,
        userId: input.userId,
        subscriptionId: input.subscriptionId
    });

    const user = await userModel.findById(input.userId);
    if (!user) {
        logger.error('User not found for notification', { userId: input.userId });
        return;
    }

    let subject = '';
    let templateName = '';

    switch (input.type) {
        case 'CANCELLATION':
            subject = 'Your Subscription has been Cancelled';
            templateName = 'cancellation';
            break;
        case 'PAYMENT_FAILURE':
            subject = 'Action Required: Payment Failed for Your Subscription';
            templateName = 'payment-failure';
            break;
        case 'EXPIRY':
            subject = 'Your Subscription has Expired';
            templateName = 'expiry';
            break;
    }

    try {
        const html = await emailService.renderTemplate(templateName, {
            fullName: user.full_name || 'Customer',
            subscriptionId: input.subscriptionId
        });

        await emailService.sendMail(user.email, subject, html);
        logger.info(`Notification sent successfully to ${user.email}`, { type: input.type });
    } catch (error: any) {
        logger.error('Failed to send subscription failure notification', {
            userId: input.userId,
            email: user.email,
            error: error.message
        });
    }
}
