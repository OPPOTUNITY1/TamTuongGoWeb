export interface ProductDto {
  id?: string;
  shopId?: string;
  categoryId?: string;
  categoryName?: string;
  productName?: string;
  retailPrice?: number;
  importPrice?: number;
  imageUrl?: string;
  productImages?: Array<{
    id?: string;
    productId?: string;
    imageUrl?: string;
  }>;
  quantity?: number;
  detail?: string;
  thumbnailUrl?: string;
  shopName?: string;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
