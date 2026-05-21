export interface OrderRequest{
    id?: string;
    userId?: string;
    userInformationId?: string;
    orderDate?: string;
    totalAmount?: number;
    status?: string;
    discountCode?: string;
}
export interface OrderSearch{
    userId?: string;
    userInformationId?: string;
    orderDateFrom?: string;
    orderDateTo?: string;
    status?: string;
}