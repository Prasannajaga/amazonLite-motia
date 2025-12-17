import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'RefreshToken',
    type: 'api',
    path: '/auth/refresh',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
}

export const handler: Handlers['RefreshToken'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Refreshing token')
    return {
        status: 200,
        body: {
            access_token: "new-mock-access-token",
            token_type: "bearer",
            refresh_token: "new-mock-refresh-token"
        }
    }
}
