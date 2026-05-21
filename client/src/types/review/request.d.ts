export interface ReviewRequest {
  id?: string;
  productId?: string;
  userId?: string;
  orderId?: string;
  rating?: number;
  comment?: string;
  reviewImages?: ReviewImageDto[];
}
export interface ReviewSearch {
  productId?: string;
  userId?: string;
  orderId?: string;
}