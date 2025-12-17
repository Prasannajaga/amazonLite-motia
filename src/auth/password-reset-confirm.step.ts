import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import { notificationService } from '../services/NotificationService'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'ConfirmPasswordReset',
    type: 'api',
    path: '/auth/password-reset/confirm',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
    bodySchema: z.object({
        token: z.string(),
        new_password: z.string().min(8),
    }),
}

interface PasswordResetConfirm {
    token: string
    new_password: string
}

export const handler: Handlers['ConfirmPasswordReset'] = async (req, { logger, emit }) => {
    const body = req.body as PasswordResetConfirm;
    logger.info('Confirming password reset')

    try {
        const user = await authService.resetPassword(body.token, body.new_password);

        await emit({
            topic: 'send-notification',
            data: {
                email: user.email,
                subject: 'Password Changed Successfully',
                templateId: 'password-changed',
                templateData: {
                    name: user.full_name
                }
            }
        });

        return {
            status: 200,
            body: {
                message: "Password has been reset successfully"
            }
        }
    } catch (error: any) {
        logger.error('Password reset confirmation failed', { error: error.message });
        return {
            status: 400,
            body: { error: error.message }
        }
    }
}
