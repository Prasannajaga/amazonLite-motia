import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { planService, CreatePlanRequest } from '../../services/PlanService'

export const config: ApiRouteConfig = {
    name: 'CreatePlan',
    type: 'api',
    path: '/plans',
    method: 'POST',
    flows: ['subscription-flow'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        billing_cycle: z.enum(['monthly', 'yearly']),
        features: z.any().optional(),
    }),
}

export const handler: Handlers['CreatePlan'] = async (req, { logger }) => {
    const body = req.body as CreatePlanRequest;
    logger.info('Creating plan', { name: body.name })

    try {
        const plan = await planService.createPlan(body);
        return {
            status: 201,
            body: plan
        }
    } catch (error: any) {
        logger.error('Plan creation failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to create plan' }
        }
    }
}
