import { BaseModel, PaginatedResult } from './BaseModel';
import { PoolClient } from 'pg';

export interface OrderEntity {
    id: string;
    user_id: string;
    order_status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'deleted';
    total_amount: number;
    currency: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export class Order extends BaseModel<OrderEntity> {
    protected tableName = 'orders';

    async findOrderById(id: string) {
        return this.withClient(async (client) => {
            const result = await client.query<OrderEntity>(
                `SELECT * FROM ${this.tableName} WHERE id = $1 AND order_status != 'deleted'`,
                [id]
            );
            return result.rows[0] || null;
        });
    }


}

export const orderModel = new Order();

