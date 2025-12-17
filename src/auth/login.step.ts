import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'Login',
    type: 'api',
    path: '/auth/login',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
}

export const handler: Handlers['Login'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Login attempt', { email: body.username })
    return {
        status: 200,
        body: {
            access_token: "mock-access-token",
            token_type: "bearer",
            refresh_token: "mock-refresh-token"
        }
    }
}
