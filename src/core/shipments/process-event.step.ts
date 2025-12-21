import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import { shipmentService } from '../../services/ShipmentService'
import { systemTraceService } from '../../services/SystemTraceService'

export const config: EventConfig = {
    type: 'event',
    name: 'ProcessShipmentEvent',
    description: 'Processes shipment events asynchronously and updates trace status',
    flows: ['Orders'],
    subscribes: ['SHIPMENT_EVENT_RECEIVED'],
    emits: [],
    input: z.object({
        shipmentId: z.string(),
        eventType: z.string(),
        facility: z.string().default("na"),
        metadata: z.record(z.string(), z.any()).optional().nullable(),
        traceId: z.string()
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

export const handler: Handlers['ProcessShipmentEvent'] = async (input, { logger }) => {
    logger.info('Processing shipment event', { shipmentId: input.shipmentId, eventType: input.eventType });

    try {
        await shipmentService.addShipmentEvent(
            input.shipmentId,
            input.eventType as any,
            input.facility,
            input.metadata ?? {}
        );

        await systemTraceService.logSuccess(input.traceId, {
            message: 'Shipment event processed successfully'
        });

        logger.info('Shipment event processed and trace updated', { shipmentId: input.shipmentId, traceId: input.traceId });
    } catch (error: any) {
        logger.error('Failed to process shipment event', { shipmentId: input.shipmentId, error: error.message });

        await systemTraceService.logFailure(input.traceId, error);
    }
}
