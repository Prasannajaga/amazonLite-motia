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
}

export const productModel = new Product();
