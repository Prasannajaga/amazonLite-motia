import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'RequestPasswordReset',
    type: 'api',
    path: '/auth/password-reset',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
}

export const handler: Handlers['RequestPasswordReset'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Password reset requested', { email: body.email })
    return {
        status: 200,
        body: {
            message: "If the email exists, a password reset link has been sent"
        }
    }
}
