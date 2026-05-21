export interface ReviewDto {
  id?: string;
  productId?: string;
  userId?: string;
  orderId?: string;
  rating?: number;
  comment?: string;
  reviewImages?: ReviewImageDto[];
}