export interface PromotionUsageRequest{
    id?: string;
    promotionId?: string;
    orderId?: string;
    userId?: string;
    usedAt?: string;
    discountAmount?: number;
}
export interface PromotionUsageSearch{
    promotionId?: string;
    orderId?: string;
    userId?: string;
}