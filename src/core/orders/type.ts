interface OrderItemRequest {
    product_id: string;
    quantity: number;
    price_at_purchase: number;
}

interface CreateOrderRequest {
    items: OrderItemRequest[];
    currency: string;
}



interface UpdateOrderRequest {
    order_status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    notes?: string;
}

export {
    OrderItemRequest,
    CreateOrderRequest,
    UpdateOrderRequest
}