import axiosInstance from "../axiosInstance";
import type { OrderStatusHistoryDto } from "../../types/orderStatusHistory/dto";
import type { OrderStatusHistoryRequest, OrderStatusHistorySearch } from "../../types/orderStatusHistory/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class OrderStatusHistoryServiceGenerated {
  protected readonly BASE = "/api/OrderStatusHistory";

  async get(id: string): Promise<DataResponse<OrderStatusHistoryDto>> {
    const res = await axiosInstance.get(`${this.BASE}/${id}`);
    return res.data;
  }

  async getData(search: OrderStatusHistorySearch = {}): Promise<DataResponse<PagedList<OrderStatusHistoryDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: OrderStatusHistoryRequest): Promise<DataResponse<OrderStatusHistoryDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: OrderStatusHistoryRequest): Promise<DataResponse<OrderStatusHistoryDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/${id}`);
    return res.data;
  }
}

export default OrderStatusHistoryServiceGenerated;
