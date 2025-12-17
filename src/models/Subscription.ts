import { BaseModel } from './BaseModel';

export interface SubscriptionEntity {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired';
    start_date: Date;
    end_date: Date | null;
    cancelled_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export class Subscription extends BaseModel<SubscriptionEntity> {
    protected tableName = 'subscriptions';

    async findByUserId(userId: string): Promise<SubscriptionEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE user_id = $1`,
                [userId]
            );
            return result.rows;
        });
    }
}

export const subscriptionModel = new Subscription();
