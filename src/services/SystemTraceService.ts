import { systemTraceModel, SystemTraceEntity } from '../models/SystemTrace';
import crypto from 'crypto';

export class SystemTraceService {
    async startTrace(params: {
        entity_type: SystemTraceEntity['entity_type'];
        entity_id: string;
        action: string;
        actor_type: SystemTraceEntity['actor_type'];
        actor_id?: string;
        source?: string;
        request_id?: string;
        trace_id?: string;
        parent_trace_id?: string;
        metadata?: any;
    }): Promise<SystemTraceEntity> {
        return systemTraceModel.create({
            trace_id: params.trace_id ?? crypto.randomUUID(),
            parent_trace_id: params.parent_trace_id ?? null,
            entity_type: params.entity_type,
            entity_id: params.entity_id,
            action: params.action,
            status: 'PENDING',
            actor_type: params.actor_type,
            actor_id: params.actor_id ?? null,
            source: params.source ?? null,
            request_id: params.request_id ?? null,
            metadata: params.metadata ?? {},
        });
    }

    async updateTrace(id: string, status: 'SUCCESS' | 'FAILED', metadata?: any): Promise<SystemTraceEntity | null> {
        const updateData: any = { status };
        if (metadata) {
            const existing = await systemTraceModel.findById(id);
            if (existing && typeof existing.metadata === 'object' && typeof metadata === 'object') {
                updateData.metadata = { ...existing.metadata, ...metadata };
            } else {
                updateData.metadata = metadata;
            }
        }
        return systemTraceModel.update(id, updateData);
    }

    async logFailure(id: string, error: any): Promise<SystemTraceEntity | null> {
        return this.updateTrace(id, 'FAILED', {
            error: error.message || String(error),
            stack: error.stack
        });
    }

    async logSuccess(id: string, extraMetadata?: any): Promise<SystemTraceEntity | null> {
        return this.updateTrace(id, 'SUCCESS', extraMetadata);
    }
}

export const systemTraceService = new SystemTraceService();
