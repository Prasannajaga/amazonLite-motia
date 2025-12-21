import { BaseModel } from './BaseModel';

export interface ShipmentEventEntity {
    id: string;
    shipment_id: string;
    event_type: 'SHIPMENT_CREATED' | 'PACKED' | 'DEPARTED_WAREHOUSE' | 'ARRIVED_HUB' | 'DEPARTED_HUB' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED_DELIVERY' | 'RETURNED';
    facility: string | null;
    metadata: any;
    occurred_at: Date;
    created_at: Date;
}

export class ShipmentEvent extends BaseModel<ShipmentEventEntity> {
    protected tableName = 'shipment_events';

    async findByShipmentId(shipmentId: string): Promise<ShipmentEventEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query<ShipmentEventEntity>(
                `SELECT * FROM ${this.tableName} WHERE shipment_id = $1 ORDER BY occurred_at ASC`,
                [shipmentId]
            );
            return result.rows;
        });
    }
}

export const shipmentEventModel = new ShipmentEvent();
