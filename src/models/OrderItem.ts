import { BaseModel } from './BaseModel';

export interface OrderItemEntity {
    id: string;
    order_id: string;
    product_name: string;
    product_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: Date;
}

export class OrderItem extends BaseModel<OrderItemEntity> {
    protected tableName = 'order_items';

    async findByOrderId(orderId: string): Promise<OrderItemEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT * FROM ${this.tableName} WHERE order_id = $1`,
                [orderId]
            );
            return result.rows;
        });
    }
}

export const orderItemModel = new OrderItem();
