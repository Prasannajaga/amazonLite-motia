import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { productService } from '../../services/ProductService'

export const config: ApiRouteConfig = {
    name: 'DeleteProduct',
    type: 'api',
    path: '/products/delete/:id',
    method: 'DELETE',
    flows: ['Products'],
    description: "Delete a product",
    emits: [],
    middleware: [authMiddleware],
}



export const handler: Handlers['DeleteProduct'] = async (req, { logger }) => {
    console.log(req.body);
    const id = req.pathParams.id;
    logger.info('Deleting product', id)
    try {
        const success = await productService.deleteProduct(id);

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
