import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { shipmentService } from '../../services/ShipmentService'
import { userModel } from '../../models/User'
import { notificationService } from '../../services/NotificationService'

export const config: EventConfig = {
    type: 'event',
    name: 'OrderPaidShipmentTrigger',
    description: 'Triggers shipment creation when an order is paid',
    flows: ['Orders'],
    subscribes: ['ORDER_PAID'],
    emits: [],
    input: z.object({
        orderId: z.string(),
        userId: z.string(),
    }),
    infrastructure: {
        handler: {
            timeout: 60,
        },
        queue: {
            maxRetries: 5,
            delaySeconds: 60,
        }
    }
}

export const handler: Handlers['OrderPaidShipmentTrigger'] = async (input, { logger }) => {
    logger.info('Order paid event received, creating shipment', { orderId: input.orderId });

    try {
        const shipment = await shipmentService.createShipment(input.orderId);
        logger.info('Shipment created successfully', { shipmentId: shipment.id, trackingNumber: shipment.tracking_number });

        // Fetch user details for notification
        const user = await userModel.findById(input.userId);
        if (user) {
            await notificationService.sendEmail(
                user.email,
                'Order Placed Successfully!',
                'order-success',
                {
                    name: user.full_name || 'Customer',
                    orderId: input.orderId,
                    trackingNumber: shipment.tracking_number
                }
            );
            logger.info('Order success notification sent directly', { userId: input.userId, orderId: input.orderId });
        } else {
            logger.warn('User not found for notification', { userId: input.userId });
        }

    } catch (error: any) {
        logger.error('Failed to create shipment for paid order', { orderId: input.orderId, error: error.message });
    }
}
