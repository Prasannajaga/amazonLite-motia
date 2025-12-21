import { BaseModel } from './BaseModel';

export interface ReviewEntity {
    id: string;
    order_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: Date;
    updated_at: Date;
}

export class Review extends BaseModel<ReviewEntity> {
    protected tableName = 'reviews';

    async findByOrderId(orderId: string): Promise<ReviewEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query<ReviewEntity>(
                `SELECT * FROM ${this.tableName} WHERE order_id = $1`,
                [orderId]
            );
            return result.rows;
        });
    }

    async findByUserAndOrder(userId: string, orderId: string): Promise<ReviewEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query<ReviewEntity>(
                `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND order_id = $2`,
                [userId, orderId]
            );
            return result.rows[0] || null;
        });
    }
}

export const reviewModel = new Review();
