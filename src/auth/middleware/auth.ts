import { ApiMiddleware } from 'motia'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key'

export const authMiddleware: ApiMiddleware = async (req, ctx, next) => {
    const authHeader = req.headers.authorization as string
    ctx.logger.info('Authenticating user', { authHeader });

    if (!authHeader) {
        ctx.logger.info('No token provided');
        return { status: 401, body: { error: 'No token provided' } }
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        ctx.logger.info('Invalid token format');
        return { status: 401, body: { error: 'Invalid token format' } }
    }

    const token = parts[1]
    ctx.logger.info('Token received', { token });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        return next()
    } catch (error) {
        return { status: 401, body: { error: 'Unauthorized: Invalid token' } }
    }
}
