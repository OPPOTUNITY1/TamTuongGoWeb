export interface OrderItemRequest{
  id?: string;
  orderId?: string;
  shopId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
}
export interface OrderItemSearch{
  orderId?: string;
  shopId?: string;
  productId?: string;
}