export interface CategoryRequestDto {
  id?: string;
  shopId: string;
  sellersId?: string;
  categoryName?: string;
  parentCategoryId?: string;
}

export interface CategorySearchDto {
  id?: string;
  shopId?: string;
  categoryName?: string;
  parentCategoryId?: string;
}
