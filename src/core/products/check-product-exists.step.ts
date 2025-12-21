import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { productService } from '../../services/ProductService'
import { CreateProductRequest } from './type'

export const config: ApiRouteConfig = {
    name: 'CheckProductExists',
    type: 'api',
    path: '/checkproductexists',
    description: "check all products are in stock return true if all products are in stock else false",
    method: 'POST',
    flows: ['Products'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        productIds: z.array(z.string())
    }),
}

export const handler: Handlers['CheckProductExists'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Checking product exists and stock availability', { productIds: body.productIds })

    try {
        const allExistAndAvailable = await productService.checkProductExists(body.productIds);

        return {
            status: 200,
            body: { exists: allExistAndAvailable }
        }
    } catch (error: any) {
        logger.error('Product existence check failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to check product availability' }
        }
    }
}
