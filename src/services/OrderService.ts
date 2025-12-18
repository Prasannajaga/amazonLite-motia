import { getDb } from '../config/dbConfig';
import { orderModel, OrderEntity } from '../models/Order';
import { orderItemModel, OrderItemEntity } from '../models/OrderItem';
import { CreateOrderRequest } from '../core/orders/type';

export class OrderService {

    async createOrder(userId: string, data: CreateOrderRequest) {
        const client = await getDb();

        try {
            await client.query('BEGIN');

            let totalAmount = 0;
            const itemsToInsert = [];

            for (const item of data.items) {

                const stockResult = await client.query(
                    `
                        UPDATE products
                        SET stock_quantity = stock_quantity - $1
                        WHERE id = $2
                        AND is_active = TRUE
                        AND stock_quantity >= $1
                        RETURNING id, name, price
                        `,
                    [item.quantity, item.product_id]
                );

                if (stockResult.rowCount === 0) {
                    throw new Error(`Insufficient stock for product ${item.product_id}`);
                }

                const product = stockResult.rows[0];
                const unitPrice = Number(product.price);
                const itemTotal = unitPrice * item.quantity;
                totalAmount += itemTotal;

                itemsToInsert.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    total_price: itemTotal
                });
            }

            const orderResult = await client.query<OrderEntity>(
                `
                    INSERT INTO orders (user_id, total_amount, currency, order_status)
                    VALUES ($1, $2, $3, 'pending')
                    RETURNING *
                    `,
                [userId, totalAmount, data.currency]
            );

            const order = orderResult.rows[0];

            for (const item of itemsToInsert) {
                await client.query(
                    `
                        INSERT INTO order_items
                        (order_id, product_id, product_name, quantity, unit_price, total_price)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        `,
                    [
                        order.id,
                        item.product_id,
                        item.product_name,
                        item.quantity,
                        item.unit_price,
                        item.total_price
                    ]
                );
            }

            await client.query('COMMIT');
            return order;

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }


    async getUserOrders(userId: string, limit?: number, cursor?: string) {
        return await orderModel.findAllPaginated(limit, cursor, 'user_id = $2 AND order_status != $3', [userId, 'deleted']);
    }

    async getOrder(orderId: string, userId: string): Promise<{ order: OrderEntity; items: OrderItemEntity[] } | null> {
        const order = await orderModel.findOrderById(orderId);
        if (!order) return null;

        if (order.user_id !== userId) {
            return null;
        }

        const items = await orderItemModel.findByOrderId(orderId);
        return {
            order,
            items
        };
    }

    async updateOrder(orderId: string, userId: string, data: { order_status?: OrderEntity['order_status']; notes?: string }): Promise<OrderEntity | null> {
        const order = await orderModel.findOrderById(orderId);
        if (!order) return null;
        if (order.user_id !== userId) return null;

        const updateData: Partial<OrderEntity> = {};
        if (data.order_status) updateData.order_status = data.order_status;
        if (data.notes !== undefined) updateData.notes = data.notes;

        return await orderModel.update(orderId, updateData);
    }

    async deleteOrder(orderId: string, userId: string): Promise<boolean> {
        const order = await orderModel.findOrderById(orderId);
        if (!order) return false;
        if (order.user_id !== userId) return false;

        const result = await orderModel.update(orderId, { order_status: 'deleted' });
        return !!result;
    }

}

export const orderService = new OrderService();
