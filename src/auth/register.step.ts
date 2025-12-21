import { ApiRouteConfig, Handlers } from 'motia'
import { authService } from '../services/AuthService'
import z from 'zod';

export const config: ApiRouteConfig = {
    name: 'Register',
    type: 'api',
    path: '/auth/register',
    method: 'POST',
    flows: ['Auth'],
    emits: ["send-notification"],
    bodySchema: z.object({
        email: z.string(),
        password: z.string(),
        full_name: z.string().optional(),
    })
}

interface RegisterRequest {
    email: string
    password: string
    full_name?: string
}

export const handler: Handlers['Register'] = async (req, { logger, emit }) => {
    const body = req.body as RegisterRequest;
    logger.info('Registering user', { email: body.email })

    try {
        const user = await authService.register(body);

        await emit({
            topic: 'send-notification',
            data: {
                email: user.email,
                subject: 'Welcome to amazonLite',
                templateId: 'welcome',
                templateData: {
                    name: user.full_name
                }
            }
        });

        return {
            status: 201,
            body: user
        }
    } catch (error: any) {
        logger.error('Registration failed', { error: error.message });
        return {
            status: 400,
            body: { error: error.message }
        }
    }
}
