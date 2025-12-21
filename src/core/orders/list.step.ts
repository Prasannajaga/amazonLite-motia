import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { orderService } from '../../services/OrderService'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'ListOrders',
    type: 'api',
    path: '/orders',
    description: "List the orders of the user",
    method: 'GET',
    flows: ['Orders'],
    emits: [],
    middleware: [authMiddleware],
}

export const handler: Handlers['ListOrders'] = async (req, { logger }) => {
    const user = (req as any).user;
    const limit = req.queryParams?.limit ? parseInt(req.queryParams.limit as string) : 20;
    const cursor = req.queryParams?.cursor as string | undefined;

    try {
        const result = await orderService.getUserOrders(user.sub, limit, cursor);
        return {
            status: 200,
            body: result
        }
    } catch (error: any) {
        logger.error('Failed to list orders', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to list orders' }
        }
    }
}
