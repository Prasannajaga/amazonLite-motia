import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { planService } from '../../services/PlanService'

export const config: ApiRouteConfig = {
    name: 'DeletePlan',
    type: 'api',
    path: '/plans/:id',
    method: 'DELETE',
    flows: ['subscription-flow'],
    emits: [],
    middleware: [authMiddleware],
}

export const handler: Handlers['DeletePlan'] = async (req, { logger }) => {
    const { id } = req.pathParams;
    logger.info('Deleting plan', { id })

    try {
        const success = await planService.deletePlan(id as string);
        if (!success) {
            return {
                status: 404,
                body: { error: 'Plan not found' }
            }
        }
        return {
            status: 200,
            body: { message: 'Plan deleted' }
        }
    } catch (error: any) {
        logger.error('Plan deletion failed', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to delete plan' }
        }
    }
}
