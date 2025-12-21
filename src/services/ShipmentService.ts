import { getDb } from '../config/dbConfig';
import { shipmentModel, ShipmentEntity } from '../models/Shipment';
import { shipmentEventModel, ShipmentEventEntity } from '../models/ShipmentEvent';
import { orderModel } from '../models/Order';
import crypto from 'crypto';

export class ShipmentService {

    async createShipment(orderId: string, initialFacility: string = 'Main Warehouse'): Promise<ShipmentEntity> {
        const client = await getDb();
        try {
            await client.query('BEGIN');

            const trackingNumber = `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            const shipment = await shipmentModel.create({
                order_id: orderId,
                tracking_number: trackingNumber,
                status: 'created',
            });

            await shipmentEventModel.create({
                shipment_id: shipment.id,
                event_type: 'SHIPMENT_CREATED',
                facility: initialFacility,
                metadata: {}
            });

            await client.query('COMMIT');
            return shipment;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async addShipmentEvent(
        shipmentId: string,
        eventType: ShipmentEventEntity['event_type'],
        facility?: string,
        metadata: any = {}
    ): Promise<ShipmentEntity> {
        const client = await getDb();
        try {
            await client.query('BEGIN');

            await shipmentEventModel.create({
                shipment_id: shipmentId,
                event_type: eventType,
                facility: facility ?? null,
                metadata: metadata
            });

            const events = await shipmentEventModel.findByShipmentId(shipmentId);
            const newStatus = this.deriveShipmentStatus(events);

            const updateData: Partial<ShipmentEntity> = { status: newStatus };
            if (eventType === 'DELIVERED') {
                updateData.delivered_at = new Date();
            }

            const isDispatchEvent = ['PACKED', 'DEPARTED_WAREHOUSE', 'ARRIVED_HUB', 'DEPARTED_HUB', 'OUT_FOR_DELIVERY'].includes(eventType);
            const currentShipment = await shipmentModel.findById(shipmentId);
            if (isDispatchEvent && currentShipment && !currentShipment.shipped_at) {
                updateData.shipped_at = new Date();
            }

            const updatedShipment = await shipmentModel.update(shipmentId, updateData);
            if (!updatedShipment) throw new Error('Failed to update shipment');

            await this.syncOrderStatus(updatedShipment.order_id);

            await client.query('COMMIT');
            return updatedShipment;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    deriveShipmentStatus(events: ShipmentEventEntity[]): ShipmentEntity['status'] {
        const types = events.map(e => e.event_type);

        if (types.includes('DELIVERED')) return 'delivered';
        if (types.includes('RETURNED')) return 'returned';
        if (types.includes('OUT_FOR_DELIVERY')) return 'out_for_delivery';

        const inTransitTypes: ShipmentEventEntity['event_type'][] = ['DEPARTED_WAREHOUSE', 'ARRIVED_HUB', 'DEPARTED_HUB'];
        if (types.some(t => inTransitTypes.includes(t))) return 'in_transit';

        if (types.includes('PACKED')) return 'packed';

        return 'created';
    }

    async syncOrderStatus(orderId: string): Promise<void> {
        const shipments = await shipmentModel.findByOrderId(orderId);
        if (shipments.length === 0) return;

        const allDelivered = shipments.every(s => s.status === 'delivered');
        const anyShipped = shipments.some(s => ['packed', 'in_transit', 'out_for_delivery', 'delivered'].includes(s.status));

        if (allDelivered) {
            await orderModel.update(orderId, { order_status: 'completed' });
        } else if (anyShipped) {
            await orderModel.update(orderId, { order_status: 'shipped' });
        }
    }

    async getTrackingInfo(orderId: string): Promise<any> {
        const shipments = await shipmentModel.findByOrderId(orderId);
        const result = [];

        for (const shipment of shipments) {
            const events = await shipmentEventModel.findByShipmentId(shipment.id);
            result.push({
                ...shipment,
                events: events
            });
        }

        return result;
    }
}

export const shipmentService = new ShipmentService();
