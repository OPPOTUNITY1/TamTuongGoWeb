export interface PromotionRequest {
    id?: string;
  shopId?: string;
  code?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  scope?: string;
  minPurchase?: number;
  maxDiscount?: number;
}
export interface PromotionSearch {
  shopId?: string;
}