import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { productService } from '../../services/ProductService'
import { DeleteProductRequest } from './type'

export const config: ApiRouteConfig = {
    name: 'DeleteProduct',
    type: 'api',
    path: '/products/delete',
    method: 'POST',
    flows: ['Products'],
    description: "Delete a product",
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        id: z.string().uuid(),
    }),
}



export const handler: Handlers['DeleteProduct'] = async (req, { logger }) => {
    const body = req.body as DeleteProductRequest;
    logger.info('Deleting product', { id: body.id })

    try {
        const success = await productService.deleteProduct(body.id);

        if (!success) {
            return { status: 404, body: { error: 'Product not found' } }
        }

        return {
            status: 200,
            body: { message: 'Product deleted successfully' }
        }
    } catch (error: any) {
        logger.error('Product deletion failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to delete product' }
        }
    }
}
