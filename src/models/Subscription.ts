import { BaseModel } from './BaseModel';

export interface SubscriptionEntity {
    id: string;
    user_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
    start_date: Date | null;
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

    async findActiveByUserId(userId: string): Promise<SubscriptionEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} 
                 WHERE user_id = $1 AND status IN ('active', 'cancelled') AND end_date > NOW() 
                 ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );
            return result.rows[0] || null;
        });
    }

    async findActiveSoonToExpire(): Promise<SubscriptionEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE status = 'active' AND end_date <= NOW()`
            );
            return result.rows;
        });
    }

    async findCancelledSoonToExpire(): Promise<SubscriptionEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE status = 'cancelled' AND end_date <= NOW()`
            );
            return result.rows;
        });
    }
}

export const subscriptionModel = new Subscription();
