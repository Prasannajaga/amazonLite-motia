import { BaseModel } from './BaseModel';

export interface ReviewEntity {
    id: string;
    order_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: Date;
    updated_at: Date;
}

export class Review extends BaseModel<ReviewEntity> {
    protected tableName = 'reviews';

    async findByProductId(productId: string): Promise<ReviewEntity[]> {
        // Note: Schema doesn't strictly link reviews to products directly, but via order -> order_items maybe? 
        // Or maybe just generic reviews? The schema has order_id and user_id.
        // For now just basic methods.
        return [];
    }
}

export const reviewModel = new Review();
