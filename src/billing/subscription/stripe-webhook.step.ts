import { ApiRouteConfig, Handlers } from 'motia'
import { orderModel } from '../../models/Order'
import { stripeMiddleWare } from '../../auth/middleware/auth';

export const config: ApiRouteConfig = {
    name: 'StripeWebhook',
    type: 'api',
    path: '/subscriptions/stripe-webhook',
    description: "Payment gateway for sucess , failure & renewal",
    method: 'POST',
    flows: ['subscription-flow', "Orders"],
    emits: ['ORDER_PAID', 'SUBSCRIPTION_NOTIFY_FAILURE', 'SUBSCRIPTION_NOTIFY_SUCESS'],
    middleware: [stripeMiddleWare]
}

export const handler: Handlers['StripeWebhook'] = async (req, { logger, emit }) => {
    const event = (req as any).event;
    logger.info('Processing Stripe event', { type: event.type });

    // handle stripe events 
    if (event.type === 'payment_intent.succeeded') {
        const object = event.data.object;
        const metadata = object.metadata || {};

        // order payment trigger 
        if (metadata.order_id) {
            logger.info('Stripe metadata contains order_id, triggering ORDER_PAID', { orderId: metadata.order_id });

            let userId = metadata.user_id;

            if (!userId) {
                const order = await orderModel.findOrderById(metadata.order_id);
                if (order) {
                    userId = order.user_id;
                }
            }

            await emit({
                topic: 'ORDER_PAID',
                data: {
                    orderId: metadata.order_id,
                    userId: userId
                }
            });
        }
        else {
            await emit({
                topic: 'SUBSCRIPTION_NOTIFY_SUCESS',
                data: {
                    type: 'CREATED',
                    userId: metadata.user_id,
                    subscriptionId: metadata.subscription_id,
                    planId: metadata.plan_id,
                }
            });
        }
    } else if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        const userId = invoice.customer as string; // Check if we should map Stripe customer ID to our userId

        logger.warn('Subscription payment failed', { subscriptionId, userId });

        await emit({
            topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
            data: {
                type: 'PAYMENT_FAILURE',
                userId: userId,
                subscriptionId: subscriptionId,
                planId: (invoice.lines?.data?.[0] as any)?.plan?.id || 'unknown'
            }
        });
    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        logger.info('Subscription deleted/cancelled in Stripe', { subscriptionId: subscription.id });

        await emit({
            topic: 'SUBSCRIPTION_NOTIFY_FAILURE',
            data: {
                type: 'CANCELLATION',
                userId: subscription.customer as string,
                subscriptionId: subscription.id,
                planId: (subscription as any).plan?.id || 'unknown',
                cancelledAt: new Date()
            }
        });
    } else if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object;
        const metadata = intent.metadata || {};

        if (metadata.order_id) {
            logger.error('Order payment failed', { orderId: metadata.order_id, error: intent.last_payment_error?.message });
            await orderModel.update(metadata.order_id, { order_status: 'cancelled' });
        }
    }

    return {
        status: 200,
        body: { received: true }
    }
}
