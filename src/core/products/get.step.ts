import { ApiRouteConfig, Handlers } from 'motia'
import { productService } from '../../services/ProductService'
import { authMiddleware } from '../../auth/middleware/auth';
import { validateIdMiddleware } from '../../auth/middleware/validate';

export const config: ApiRouteConfig = {
    name: 'GetProduct',
    type: 'api',
    path: '/product-details/:id',
    method: 'GET',
    description: "Get a product details",
    middleware: [authMiddleware, validateIdMiddleware],
    flows: ['Products'],
    emits: [],
}

//  /product-details?id=uuid
export const handler: Handlers['GetProduct'] = async (req, { logger }) => {
    const id = req.pathParams.id;

    try {
        const product = await productService.getProduct(id);
        if (!product) {
            return { status: 404, body: { error: 'Product not found' } }
        }

        return {
            status: 200,
            body: product
        }
    } catch (error: any) {
        logger.error('Failed to get product', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to get product' }
        }
    }
}
