import { ApiRouteConfig, Handlers } from 'motia'
import z from 'zod'
import { authMiddleware } from '../../auth/middleware/auth'
import { planService } from '../../services/PlanService'

export const config: ApiRouteConfig = {
    name: 'UpdatePlan',
    type: 'api',
    path: '/plans/:id',
    method: 'PATCH',
    description: "Update a plan",
    flows: ['plan'],
    emits: [],
    middleware: [authMiddleware],
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        billing_cycle: z.enum(['monthly', 'yearly']).optional(),
        features: z.any().optional(),
        is_active: z.boolean().optional(),
    }),
}

export const handler: Handlers['UpdatePlan'] = async (req, { logger }) => {
    const { id } = req.pathParams;
    const body = req.body;
    logger.info('Updating plan', { id })

    try {
        const plan = await planService.updatePlan(id as string, body);
        if (!plan) {
            return {
                status: 404,
                body: { error: 'Plan not found' }
            }
        }
        return {
            status: 200,
            body: plan
        }
    } catch (error: any) {
        logger.error('Plan update failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to update plan' }
        }
    }
}
