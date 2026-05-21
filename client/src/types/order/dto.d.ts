export interface OrderDto {
  id?: string;
  userId?: string;
  userInformationId?: string;
  orderDate?: string;
  totalAmount?: number;
  status?: string;
  discountCode?: string;
}