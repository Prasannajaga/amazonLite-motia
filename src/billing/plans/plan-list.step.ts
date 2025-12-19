import { ApiRouteConfig, Handlers } from 'motia'
import { authMiddleware } from '../../auth/middleware/auth'
import { planService } from '../../services/PlanService'

export const config: ApiRouteConfig = {
    name: 'ListPlans',
    type: 'api',
    path: '/plans',
    method: 'GET',
    flows: ['plan'],
    description: "List all plans",
    emits: [],
    middleware: [authMiddleware],
    queryParams: [
        {
            name: "limit",
            description: "Limit of plans to return",
        },
        {
            name: "cursor",
            description: "Cursor for pagination",
        }
    ]
}

export const handler: Handlers['ListPlans'] = async (req, { logger }) => {
    const { limit, cursor } = req.queryParams;
    try {
        const result = await planService.listPlans(
            limit ? parseInt(limit as string) : 10,
            cursor as string || null
        );
        return {
            status: 200,
            body: result
        }
    } catch (error: any) {
        logger.error('Failed to list plans', { error: error.message });
        return {
            status: 500,
            body: { error: 'Failed to list plans' }
        }
    }
}
