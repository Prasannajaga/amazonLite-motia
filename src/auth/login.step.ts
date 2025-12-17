import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import z from 'zod';

export const config: ApiRouteConfig = {
    name: 'Login',
    type: 'api',
    path: '/auth/login',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
    bodySchema: z.object({
        username: z.string(),
        password: z.string(),
    }),
}

interface LoginRequest {
    username: string;
    password: string;
}

export const handler: Handlers['Login'] = async (req, { logger }) => {
    const body = req.body as LoginRequest;
    logger.info('Login attempt', { email: body.username })

    try {
        const result = await authService.login(body);
        return {
            status: 200,
            body: result
        }
    } catch (error: any) {
        logger.error('Login failed', { error: error.message });
        return {
            status: 401,
            body: { error: error.message }
        }
    }
}
