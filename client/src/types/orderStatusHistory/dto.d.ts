export interface OrderStatusHistoryDto {
  id?: string;
  orderId?: string;
  status?: string;
  note?: string;
  sendEmail?: boolean;
}