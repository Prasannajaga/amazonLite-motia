import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { shipmentService } from '../../services/ShipmentService'

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
    } catch (error: any) {
        logger.error('Failed to create shipment for paid order', { orderId: input.orderId, error: error.message });
    }
}
