export interface ProductRequestDto {
  id?: string;
  shopId: string;
  categoryId?: string;
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
  soldCount?: number;
}

export interface ProductSearchDto {
  pageIndex?: number;
  pageSize?: number;
  id?: string;
  shopId?: string;
  productName?: string;
  retailPrice?: number;
}
