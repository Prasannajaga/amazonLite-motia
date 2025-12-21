import { BaseModel } from './BaseModel';

export interface ShipmentEntity {
    id: string;
    order_id: string;
    tracking_number: string;
    carrier: string | null;
    status: 'created' | 'packed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
    shipped_at: Date | null;
    delivered_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export class Shipment extends BaseModel<ShipmentEntity> {
    protected tableName = 'shipments';

    async findByOrderId(orderId: string): Promise<ShipmentEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query<ShipmentEntity>(
                `SELECT * FROM ${this.tableName} WHERE order_id = $1 ORDER BY created_at ASC`,
                [orderId]
            );
            return result.rows;
        });
    }

    async findByTrackingNumber(trackingNumber: string): Promise<ShipmentEntity | null> {
        return this.withClient(async (client) => {
            const result = await client.query<ShipmentEntity>(
                `SELECT * FROM ${this.tableName} WHERE tracking_number = $1`,
                [trackingNumber]
            );
            return result.rows[0] || null;
        });
    }
}

export const shipmentModel = new Shipment();
