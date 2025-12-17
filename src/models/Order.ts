import { BaseModel } from './BaseModel';

export interface OrderEntity {
    id: string;
    user_id: string;
    order_status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    total_amount: number;
    currency: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export class Order extends BaseModel<OrderEntity> {
    protected tableName = 'orders';

    async findByUserId(userId: string): Promise<OrderEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
            return result.rows;
        });
    }
}

export const orderModel = new Order();
