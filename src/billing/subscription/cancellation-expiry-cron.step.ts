import { CronConfig, Handlers } from 'motia'
import { subscriptionService } from '../../services/SubscriptionService'

export const config: CronConfig = {
    type: 'cron',
    cron: '0 * * * *',
    name: 'CancellationExpiryJob',
    description: 'Expires cancelled subscriptions that have reached their end date',
    emits: ['SUBSCRIPTION_NOTIFY_FAILURE'],
    flows: ['subscription-flow'],
}

export const handler: Handlers['CancellationExpiryJob'] = async ({ logger, emit }) => {
    logger.info('Starting CancellationExpiryJob');

    try {
        await subscriptionService.findCancelledSoonToExpire(async (soonToExpire) => {
            logger.info(`Processing ${soonToExpire.length} cancelled subscriptions for expiry`);

            for (const sub of soonToExpire) {
                try {
                    const expiredSub = await subscriptionService.expireCancelledSubscription(sub.id);
                    if (expiredSub) {
                        await emit({
                            topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
                            data: {
                                type: "EXPIRY",
                                userId: expiredSub.user_id,
                                subscriptionId: expiredSub.id,
                                planId: expiredSub.plan_id
                            }
                        });
                    }
                } catch (err: any) {
                    logger.error(`Failed to expire subscription ${sub.id}`, { error: err.message });
                }
            }
        });
    } catch (error: any) {
        logger.error('CancellationExpiryJob failed', { error: error.message });
    }
}
