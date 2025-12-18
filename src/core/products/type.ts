interface UpdateProductRequest {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    stock_quantity?: number;
    image_url?: string;
    is_active?: boolean;
}

interface DeleteProductRequest {
    id: string;
}

interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
}

export { UpdateProductRequest, DeleteProductRequest, CreateProductRequest }