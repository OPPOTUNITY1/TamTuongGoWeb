export interface CartRequest{
    id?: string;
    userId?: string;
    productId?: string;
    quantity?: number;
}
export interface CartSearch{
    userId?: string;
    productId?: string;
}