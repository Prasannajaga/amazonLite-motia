import { productModel, ProductEntity } from '../models/Product';
import { CreateProductRequest } from '../core/products/type';
import { PaginatedResult } from '../models/BaseModel';

export class ProductService {
    async listProducts(limit: number, cursor: string | null = null): Promise<PaginatedResult<ProductEntity>> {
        return await productModel.findAllPaginated(limit, cursor, 'is_active = $2', [true]);
    }

    async getProduct(productId: string): Promise<ProductEntity | null> {
        return await productModel.findById(productId);
    }

    async createProduct(data: CreateProductRequest): Promise<ProductEntity> {
        return await productModel.create({
            name: data.name,
            description: data.description,
            price: data.price,
            stock_quantity: data.stock_quantity,
            image_url: data.image_url,
            is_active: true
        });
    }

    async updateProduct(productId: string, data: Partial<ProductEntity>): Promise<ProductEntity | null> {
        return await productModel.update(productId, data);
    }

    async deleteProduct(productId: string): Promise<boolean> {
        return await productModel.delete(productId);
    }
}

export const productService = new ProductService();
