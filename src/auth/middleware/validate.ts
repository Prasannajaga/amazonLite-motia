import { ApiMiddleware } from 'motia'
import z from 'zod'

export const validateIdMiddleware: ApiMiddleware = async (req, ctx, next) => {
    const id = req.pathParams.id;

    if (!id) {
        ctx.logger.error('Validation failed: ID missing in path params');
        return {
            status: 400,
            body: { error: 'ID is required' }
        }
    }

    const uuidValidation = z.string().uuid().safeParse(id);
    if (!uuidValidation.success) {
        ctx.logger.error('Validation failed: Invalid UUID format', { id });
        return {
            status: 400,
            body: {
                error: 'Invalid ID format. Expected a valid UUID.'
            }
        }
    }

    return next();
}
