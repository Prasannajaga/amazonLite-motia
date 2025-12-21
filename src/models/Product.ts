import { BaseModel } from './BaseModel';

export interface ProductEntity {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export class Product extends BaseModel<ProductEntity> {
    protected tableName = 'products';

    async checkStockAvailable(ids: string[]): Promise<boolean> {
        if (!ids || ids.length === 0) return true;

        const uniqueIds = Array.from(new Set(ids));

        return this.withClient(async (client) => {
            const result = await client.query(
                `SELECT COUNT(*) as count FROM ${this.tableName} 
                 WHERE id = ANY($1) 
                 AND stock_quantity > 0 
                 AND is_active = TRUE`,
                [uniqueIds]
            );

            const count = parseInt(result.rows[0].count);
            return count === uniqueIds.length;
        });
    }
}

export const productModel = new Product();
