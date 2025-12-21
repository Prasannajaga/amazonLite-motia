import { BaseModel } from './BaseModel';

export interface SystemTraceEntity {
    id: string;
    trace_id: string;
    parent_trace_id: string | null;
    entity_type: 'order' | 'shipment' | 'subscription' | 'payment';
    entity_id: string;
    action: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    actor_type: 'user' | 'system' | 'cron' | 'webhook' | 'admin';
    actor_id: string | null;
    source: string | null;
    request_id: string | null;
    metadata: any;
    created_at: Date;
}

export class SystemTrace extends BaseModel<SystemTraceEntity> {
    protected tableName = 'system_traces';

    async findByTraceId(traceId: string): Promise<SystemTraceEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query<SystemTraceEntity>(
                `SELECT * FROM ${this.tableName} WHERE trace_id = $1 ORDER BY created_at ASC`,
                [traceId]
            );
            return result.rows;
        });
    }

    async findByEntity(entityType: string, entityId: string): Promise<SystemTraceEntity[]> {
        return this.withClient(async (client) => {
            const result = await client.query<SystemTraceEntity>(
                `SELECT * FROM ${this.tableName} WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`,
                [entityType, entityId]
            );
            return result.rows;
        });
    }
}

export const systemTraceModel = new SystemTrace();
