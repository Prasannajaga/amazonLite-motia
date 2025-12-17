import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'RefreshToken',
    type: 'api',
    path: '/auth/refresh',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
    bodySchema: z.object({
        refresh_token: z.string(),
    }),
}

interface RefreshTokenRequest {
    refresh_token: string
}

export const handler: Handlers['RefreshToken'] = async (req, { logger }) => {
    const body = req.body as RefreshTokenRequest;
    logger.info('Refreshing token')

    try {
        const result = await authService.refreshTokens(body.refresh_token);
        return {
            status: 200,
            body: result
        }
    } catch (error: any) {
        logger.error('Token refresh failed', { error: error.message });
        return {
            status: 401,
            body: { error: error.message }
        }
    }
}
