import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import { authMiddleware } from './middleware/auth'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'Logout',
    type: 'api',
    path: '/auth/logout',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
    bodySchema: z.object({
        refresh_token: z.string(),
    }),
}

interface LogoutRequest {
    refresh_token: string
}

export const handler: Handlers['Logout'] = async (req, { logger }) => {
    const body = req.body as LogoutRequest;
    logger.info('Logging out user')

    try {
        await authService.logout(body.refresh_token);
        return {
            status: 200,
            body: {
                message: "Logged out successfully"
            }
        }
    } catch (error: any) {
        logger.error('Logout failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Logout failed' }
        }
    }
}
