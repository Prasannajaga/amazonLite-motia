import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { orderService } from '../../services/OrderService'
import { validateIdMiddleware } from '../../auth/middleware/validate'

export const config: ApiRouteConfig = {
    name: 'GetOrder',
    type: 'api',
    path: '/orders/:id',
    description: "get the order details by orderId",
    method: 'GET',
    flows: ['Orders'],
    emits: [],
    middleware: [authMiddleware, validateIdMiddleware],
}

export const handler: Handlers['GetOrder'] = async (req, { logger }) => {
    const user = (req as any).user;
    const id = req.pathParams.id;

    try {
        const orderData = await orderService.getOrder(id, user.sub);

        if (!orderData) {
            return {
                status: 404,
                body: { error: 'Order not found' }
            }
        }

        return {
            status: 200,
            body: orderData
        }
    } catch (error: any) {
        logger.error('Failed to get order', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to get order' }
        }
    }
}
