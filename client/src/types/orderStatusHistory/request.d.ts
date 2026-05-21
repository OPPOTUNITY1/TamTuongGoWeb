export interface OrderStatusHistoryRequest{
  id?: string;
  orderId?: string;
  status?: string;
  note?: string;
  sendEmail?: boolean;
}
export interface OrderStatusHistorySearch{
  orderId?: string;
  status?: string;
}