import { LIMIT } from '../constants/common';
import { BaseModel, PaginatedResult } from '../models/BaseModel';
import { QueryResultRow } from 'pg';

export class PaginationService {

    async fetchAllRecursive<T extends QueryResultRow & { id: string; created_at: Date }>(
        model: BaseModel<T>,
        callback: (items: T[]) => Promise<void> | void,
        limit: number = LIMIT,
        cursor?: string | null,
        whereClause?: string,
        whereValues: any[] = []
    ): Promise<T[]> {
        const result: PaginatedResult<T> = await model.findAllPaginated(limit, cursor, whereClause, whereValues);

        if (result.data.length > 0) {
            await callback(result.data);
        }

        if (result.nextCursor) {
            return this.fetchAllRecursive(model, callback, limit, result.nextCursor, whereClause, whereValues);
        }

        return [];
    }
}

export const paginationService = new PaginationService();
