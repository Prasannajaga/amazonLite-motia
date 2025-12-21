import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { orderService } from '../../services/OrderService'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'DeleteOrder',
    type: 'api',
    path: '/orders/:id',
    method: 'DELETE',
    description: "soft delete order by changing the order status to deleted",
    flows: ['Orders'],
    emits: [],
    middleware: [authMiddleware],
}

export const handler: Handlers['DeleteOrder'] = async (req, { logger }) => {
    const user = (req as any).user;
    const id = req.pathParams.id;

    if (!id) {
        return {
            status: 400,
            body: { error: 'Order ID is required' }
        }
    }

    try {
        const success = await orderService.deleteOrder(id, user.sub);

        if (!success) {
            return {
                status: 404,
                body: { error: 'Order not found or permission denied' }
            }
        }

        return {
            status: 200,
            body: { message: 'Order deleted successfully' }
        }
    } catch (error: any) {
        logger.error('Failed to delete order', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to delete order' }
        }
    }
}
