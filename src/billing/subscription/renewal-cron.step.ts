import { CronConfig, Handlers } from 'motia'
import { subscriptionService } from '../../services/SubscriptionService'

export const config: CronConfig = {
    type: 'cron',
    cron: '0 * * * *',
    name: 'SubscriptionRenewalJob',
    description: 'Renews active subscriptions that have reached their end date',
    emits: ['SUBSCRIPTION_NOTIFY_FAILURE', 'SUBSCRIPTION_NOTIFY_SUCESS'],
    flows: ['subscription-flow'],
}


export const handler: Handlers['SubscriptionRenewalJob'] = async ({ logger, emit }) => {
    logger.info('Starting SubscriptionRenewalJob');
    try {
        const soonToExpire = await subscriptionService.findActiveSoonToExpire();
        logger.info(`Found ${soonToExpire.length} subscriptions to renew`);

        for (const sub of soonToExpire) {
            try {
                const result = await subscriptionService.renewSubscription(sub.id);

                if (!result) continue;

                if (result.success) {

                    await emit({
                        topic: "SUBSCRIPTION_NOTIFY_SUCESS",
                        data: {
                            type: 'CREATED',
                            userId: result.subscription.user_id,
                            subscriptionId: result.subscription.id,
                            planId: result.subscription.plan_id
                        }
                    })


                } else {

                    await emit({
                        topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
                        data: {
                            type: 'PAYMENT_FAILURE',
                            userId: result.subscription.user_id,
                            subscriptionId: result.subscription.id,
                            planId: result.subscription.plan_id
                        }
                    });

                    await emit({
                        topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
                        data: {
                            type: "EXPIRY",
                            userId: result.subscription.user_id,
                            subscriptionId: result.subscription.id,
                            planId: result.subscription.plan_id
                        }
                    });
                }

            } catch (err: any) {
                logger.error(`Failed to renew subscription ${sub.id}`, { error: err.message });
            }
        }
    } catch (error: any) {
        logger.error('SubscriptionRenewalJob failed', { error: error.message });
    }
}
