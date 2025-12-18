import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { productService } from '../../services/ProductService'
import { CreateProductRequest } from './type'

export const config: ApiRouteConfig = {
    name: 'CreateProduct',
    type: 'api',
    path: '/products',
    method: 'POST',
    flows: ['Products'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        stock_quantity: z.number().int().nonnegative().default(0),
        image_url: z.string().url().optional(),
    }),
}

export const handler: Handlers['CreateProduct'] = async (req, { logger }) => {
    const body = req.body as CreateProductRequest;
    logger.info('Creating product', { name: body.name })

    try {
        const product = await productService.createProduct(body);

        return {
            status: 201,
            body: product
        }
    } catch (error: any) {
        logger.error('Product creation failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to create product' }
        }
    }
}
