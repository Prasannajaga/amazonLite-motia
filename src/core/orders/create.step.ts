import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { CreateOrderRequest } from './type'
import { orderService } from '../../services/OrderService'


export const config: ApiRouteConfig = {
    name: 'CreateOrder',
    type: 'api',
    path: '/orders',
    description: "create a new order by default status to pending",
    method: 'POST',
    flows: ['Orders'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        items: z.array(z.object({
            product_id: z.string(),
            quantity: z.number().int().positive(),
            price_at_purchase: z.number().positive(),
        })),
        currency: z.string().default('USD'),
    }),
}

export const handler: Handlers['CreateOrder'] = async (req, { logger }) => {
    const body = req.body as CreateOrderRequest;
    const user = (req as any).user;

    logger.info('Creating order', { userId: user.sub, itemsCount: body.items.length })

    try {
        const order = await orderService.createOrder(user.sub, body);

        return {
            status: 201,
            body: {
                message: "Order created successfully",
                order_id: order.id,
                total_amount: Number(order.total_amount)
            }
        }
    } catch (error: any) {
        logger.error('Order creation failed', { error: error.message });
        if (error.message.includes('Product not found') || error.message.includes('Insufficient stock')) {
            return {
                status: 400,
                body: { error: error.message }
            }
        }
        return {
            status: 500,
            body: { error: 'Failed to create order' }
        }
    }
}

