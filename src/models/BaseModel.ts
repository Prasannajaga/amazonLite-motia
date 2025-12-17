import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDb } from '../config/dbConfig';

export abstract class BaseModel<T extends QueryResultRow> {
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
            const result = await client.query<T>(`SELECT * FROM ${this.tableName}`);
            return result.rows;
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
        const start = 2; // $1 is id
        const updates = Object.keys(data)
            .map((key, i) => `${key} = $${i + start}`)
            .join(', ');
        const values = [id, ...Object.values(data)];

        if (!updates) return this.findById(id);

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
