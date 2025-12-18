import { ApiRouteConfig, Handlers, QueryParam } from 'motia'
import { productService } from '../../services/ProductService'
import { authMiddleware } from '../../auth/middleware/auth'

export const config: ApiRouteConfig = {
    name: 'ListProducts',
    type: 'api',
    path: '/products',
    method: 'GET',
    middleware: [authMiddleware],
    flows: ['Products'],
    emits: [],
    queryParams: [
        {
            name: "limit",
            description: "Limit of products to return",
        },
        {
            name: "cursor",
            description: "Cursor for pagination",
        }
    ]
}


export const handler: Handlers['ListProducts'] = async (req, { logger }) => {
    const { limit, cursor } = req.queryParams;
    try {
        const result = await productService.listProducts(parseInt(limit as string), cursor as string || null);
        return {
            status: 200,
            body: result
        }
    } catch (error: any) {
        logger.error('Failed to list products', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to list products' }
        }
    }
}
