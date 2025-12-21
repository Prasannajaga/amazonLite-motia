import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { orderService } from '../../services/OrderService'
import { UpdateOrderRequest } from './type'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'UpdateOrder',
    type: 'api',
    path: '/orders/:id',
    description: "user alowed to update only status and notes of the order",
    method: 'PATCH',
    flows: ['Orders'],
    emits: [''],
    middleware: [authMiddleware],
    bodySchema: z.object({
        order_status: z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
    }),
}

export const handler: Handlers['UpdateOrder'] = async (req, { logger, emit }) => {
    const user = (req as any).user;
    const id = req.pathParams.id;
    const body = req.body as UpdateOrderRequest;

    if (!id) {
        return {
            status: 400,
            body: { error: 'Order ID is required' }
        }
    }

    try {
        const updatedOrder = await orderService.updateOrder(id, user.sub, body);

        if (!updatedOrder) {
            return {
                status: 404,
                body: { error: 'Order not found or permission denied' }
            }
        }

        return {
            status: 200,
            body: updatedOrder
        }
    } catch (error: any) {
        logger.error('Failed to update order', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to update order' }
        }
    }
}
