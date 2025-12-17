import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import z from 'zod'

export const config: ApiRouteConfig = {
    name: 'RequestPasswordReset',
    type: 'api',
    path: '/auth/password-reset',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
    bodySchema: z.object({
        email: z.string().email(),
    }),
}

interface PasswordResetRequest {
    email: string
}

export const handler: Handlers['RequestPasswordReset'] = async (req, { logger, emit }) => {
    const body = req.body as PasswordResetRequest;
    logger.info('Password reset requested', { email: body.email })

    try {
        const token = await authService.requestPasswordReset(body.email);

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await emit({
            topic: 'send-notification',
            data: {
                email: body.email,
                subject: 'Password Reset Request',
                templateId: 'reset-password',
                templateData: {
                    name: 'User',
                    link: resetLink
                }
            }
        });

        return {
            status: 200,
            body: {
                message: "If the email exists, a password reset link has been sent"
            }
        }
    } catch (error: any) {
        logger.warn('Password reset request failed', { error: error.message });
        return {
            status: 200,
            body: {
                message: "If the email exists, a password reset link has been sent"
            }
        }
    }
}
