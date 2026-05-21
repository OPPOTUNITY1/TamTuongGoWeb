export interface OrderPromotionRequest{
    id?: string;
    orderId?: string;
    promotionId?: string;
    shopId?: string;
    discountAmount?: number;
}
export interface OrderPromotionSearch{
    orderId?: string;
    promotionId?: string;
    shopId?: string;
}