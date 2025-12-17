import { BaseModel } from './BaseModel';

export interface PlanEntity {
    id: string;
    name: string;
    description: string | null;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    is_active: boolean;
    features: any; // JSONB
    created_at: Date;
    updated_at: Date;
}

export class Plan extends BaseModel<PlanEntity> {
    protected tableName = 'plans';
}

export const planModel = new Plan();
