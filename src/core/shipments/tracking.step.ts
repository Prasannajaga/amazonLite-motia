import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { shipmentService } from '../../services/ShipmentService'
import { orderService } from '../../services/OrderService'

export const config: ApiRouteConfig = {
    name: 'GetTrackingInfo',
    type: 'api',
    path: '/orders/:orderId/tracking',
    method: 'GET',
    flows: ['Orders'],
    emits: [],
    middleware: [authMiddleware]
}

export const handler: Handlers['GetTrackingInfo'] = async (req, { logger }) => {
    const user = (req as any).user;
    const orderId = req.pathParams.orderId;

    logger.info('Fetching tracking info', { orderId, userId: user.sub });

    try {

        const orderInfo = await orderService.getOrder(orderId, user.sub);
        if (!orderInfo) {
            return {
                status: 404,
                body: { error: 'Order not found or permission denied' }
            }
        }

        const trackingInfo = await shipmentService.getTrackingInfo(orderId);

        return {
            status: 200,
            body: trackingInfo
        }
    } catch (error: any) {
        logger.error('Failed to fetch tracking info', { orderId, error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to fetch tracking info' }
        }
    }
}
