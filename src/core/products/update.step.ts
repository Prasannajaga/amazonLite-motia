import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { productService } from '../../services/ProductService'
import { UpdateProductRequest } from './type'

export const config: ApiRouteConfig = {
    name: 'UpdateProduct',
    type: 'api',
    path: '/products/update',
    method: 'POST',
    flows: ['Products'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        stock_quantity: z.number().int().nonnegative().optional(),
        image_url: z.string().url().optional(),
        is_active: z.boolean().optional(),
    }),
}


export const handler: Handlers['UpdateProduct'] = async (req, { logger }) => {
    const body = req.body as UpdateProductRequest;
    logger.info('Updating product', { id: body.id })

    try {
        const { id, ...updates } = body;
        const product = await productService.updateProduct(id, updates);

        if (!product) {
            return { status: 404, body: { error: 'Product not found' } }
        }

        return {
            status: 200,
            body: product
        }
    } catch (error: any) {
        logger.error('Product update failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to update product' }
        }
    }
}
