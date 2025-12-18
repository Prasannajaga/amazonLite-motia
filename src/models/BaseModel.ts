import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDb } from '../config/dbConfig';
import { LIMIT } from '../constants/contants';

export interface PaginatedResult<T> {
    data: T[];
    nextCursor: string | null;
}

export abstract class BaseModel<T extends QueryResultRow & { id: string; created_at: Date }> {
    protected abstract tableName: string;

    protected async withClient<R>(operation: (client: PoolClient) => Promise<R>): Promise<R> {
        const client = await getDb();
        try {
            return await operation(client);
        } finally {
            client.release();
        }
    }

    async findAll(): Promise<T[]> {
        return this.withClient(async (client) => {
            const result = await client.query<T>(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
            return result.rows;
        });
    }

    async findAllPaginated(limit: number = LIMIT, cursor?: string | null, whereClause?: string, whereValues: any[] = []): Promise<PaginatedResult<T>> {
        const safeLimit = Math.min(limit, 100);
        console.log("data is here", "limit", limit, safeLimit, cursor);

        return this.withClient(async (client) => {
            let query = `SELECT * FROM ${this.tableName}`;
            const values: any[] = [safeLimit + 1, ...whereValues];
            let count = whereValues.length + 1;

            const conditions: string[] = [];
            if (whereClause) {
                conditions.push(whereClause);
            }

            if (cursor) {
                const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
                const [timestamp, id] = decodedCursor.split(':');
                conditions.push(`(created_at, id) < ($${++count}, $${++count})`);
                values.push(new Date(parseInt(timestamp)), id);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ` ORDER BY created_at DESC, id DESC LIMIT $1`;

            const result = await client.query<T>(query, values);
            const hasNextPage = result.rows.length > limit;
            const data = hasNextPage ? result.rows.slice(0, limit) : result.rows;

            let nextCursor: string | null = null;
            if (hasNextPage) {
                const lastItem = data[data.length - 1];
                nextCursor = Buffer.from(`${lastItem.created_at.getTime()}:${lastItem.id}`).toString('base64');
            }

            return { data, nextCursor };
        });
    }

    async findById(id: string): Promise<T | null> {
        return this.withClient(async (client) => {
            const result = await client.query<T>(
                `SELECT * FROM ${this.tableName} WHERE id = $1`,
                [id]
            );
            return result.rows[0] || null;
        });
    }

    async create(data: Partial<T>): Promise<T> {
        const columns = Object.keys(data).join(', ');
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        return this.withClient(async (client) => {
            const result = await client.query<T>(
                `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
                values
            );
            return result.rows[0];
        });
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const entries = Object.entries(data).filter(([_, value]) => value !== undefined);

        if (entries.length === 0) return this.findById(id);

        const updates = entries
            .map(([key], i) => `${key} = $${i + 2}`)
            .join(', ');

        const values = [id, ...entries.map(([_, value]) => value)];

        return this.withClient(async (client) => {
            const result = await client.query<T>(
                `UPDATE ${this.tableName} SET ${updates} WHERE id = $1 RETURNING *`,
                values
            );
            return result.rows[0] || null;
        });
    }

    async delete(id: string): Promise<boolean> {
        return this.withClient(async (client) => {
            const result = await client.query(
                `DELETE FROM ${this.tableName} WHERE id = $1`,
                [id]
            );
            return (result.rowCount || 0) > 0;
        });
    }
}
