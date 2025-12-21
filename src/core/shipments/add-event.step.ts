import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { systemTraceService } from '../../services/SystemTraceService'

export const config: ApiRouteConfig = {
    name: 'AddShipmentEvent',
    type: 'api',
    path: '/shipments/:id/events',
    method: 'POST',
    flows: ['Orders'],
    emits: ['SHIPMENT_EVENT_RECEIVED'],
    middleware: [authMiddleware],
    bodySchema: z.object({
        event_type: z.enum([
            'PACKED',
            'DEPARTED_WAREHOUSE',
            'ARRIVED_HUB',
            'DEPARTED_HUB',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'FAILED_DELIVERY',
            'RETURNED'
        ]),
        facility: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional()
    }),
}

export const handler: Handlers['AddShipmentEvent'] = async (req, { logger, emit }) => {
    const shipmentId = req.pathParams.id;
    const body = req.body;
    const user = (req as any).user;

    logger.info('Received shipment event update', { shipmentId, eventType: body.event_type });

    try {
        const trace = await systemTraceService.startTrace({
            entity_type: 'shipment',
            entity_id: shipmentId,
            action: 'ADD_SHIPMENT_EVENT',
            actor_type: 'user',
            actor_id: user?.sub,
            source: 'api',
            metadata: {
                event_type: body.event_type,
                facility: body.facility,
                payload: body.metadata
            }
        });

        await emit({
            topic: "SHIPMENT_EVENT_RECEIVED",
            data: {
                shipmentId,
                eventType: body.event_type,
                facility: body.facility || "",
                metadata: body.metadata,
                traceId: trace.id
            }
        });

        return {
            status: 202,
            body: {
                message: 'Shipment event update received and is being processed',
                traceId: trace.trace_id
            }
        }
    } catch (error: any) {
        logger.error('Failed to initiate shipment event update', { shipmentId, error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to initiate shipment event update' }
        }
    }
}
