import { planModel, PlanEntity } from '../models/Plan';
import { PaginatedResult } from '../models/BaseModel';

export interface CreatePlanRequest {
    name: string;
    description?: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    features?: any;
}

export class PlanService {
    async listPlans(limit: number, cursor: string | null = null): Promise<PaginatedResult<PlanEntity>> {
        return await planModel.findAllPaginated(limit, cursor, 'is_active = $2', [true]);
    }

    async getPlan(planId: string): Promise<PlanEntity | null> {
        return await planModel.findById(planId);
    }

    async createPlan(data: CreatePlanRequest): Promise<PlanEntity> {
        return await planModel.create({
            name: data.name,
            description: data.description || null,
            price: data.price,
            billing_cycle: data.billing_cycle,
            features: data.features || {},
            is_active: true
        });
    }

    async updatePlan(planId: string, data: Partial<PlanEntity>): Promise<PlanEntity | null> {
        return await planModel.update(planId, data);
    }

    async deletePlan(planId: string): Promise<boolean> {
        // Soft delete or hard delete? Requirement doesn't specify. 
        // Given idx_plans_active index, setting is_active = false is common.
        const updated = await planModel.update(planId, { is_active: false });
        return !!updated;
    }
}

export const planService = new PlanService();
