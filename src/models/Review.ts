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
}

export const reviewModel = new Review();
