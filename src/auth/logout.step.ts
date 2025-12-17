import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'Logout',
    type: 'api',
    path: '/auth/logout',
    method: 'POST',
    flows: ['Auth'],
    emits: [],
}

export const handler: Handlers['Logout'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Logging out user')
    return {
        status: 200,
        body: {
            message: "Logged out successfully"
        }
    }
}
