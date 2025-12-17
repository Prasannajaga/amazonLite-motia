import { ApiRouteConfig, Handlers } from 'motia'
import { getDb } from '../config/dbConfig'

export const config: ApiRouteConfig = {
    name: 'ConfirmPasswordReset',
    type: 'api',
    path: '/auth/password-reset/confirm',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
}

export const handler: Handlers['ConfirmPasswordReset'] = async (req, { logger }) => {
    const body = req.body;
    logger.info('Confirming password reset')
    return {
        status: 200,
        body: {
            message: "Password has been reset successfully"
        }
    }
}
