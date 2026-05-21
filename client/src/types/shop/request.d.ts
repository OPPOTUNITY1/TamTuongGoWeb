export interface ShopRequestDto {
  id?: string;
  sellerId: string;
  name?: string;
}

export interface ShopSearchDto {
  pageIndex?: number;
  pageSize?: number;
  id?: string;
  sellerId?: string;
  name?: string;
}
