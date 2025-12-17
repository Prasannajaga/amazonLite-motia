import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'Register',
    type: 'api',
    path: '/auth/register',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
}
export const handler: Handlers['Register'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Registering user', { email: body.email })
    return {
        status: 201,
        body: {
            id: "mock-uuid",
            email: body.email,
            full_name: body.full_name,
            is_active: true,
            role: "user"
        }
    }
}
