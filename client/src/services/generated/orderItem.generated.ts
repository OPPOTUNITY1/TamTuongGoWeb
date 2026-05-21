import axiosInstance from "../axiosInstance";
import type { OrderItemDto } from "../../types/orderItem/dto";
import type { OrderItemRequest, OrderItemSearch } from "../../types/orderItem/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class OrderItemServiceGenerated {
  protected readonly BASE = "/api/OrderItem";

  async get(id: string): Promise<DataResponse<OrderItemDto>> {
    const res = await axiosInstance.get(`${this.BASE}/${id}`);
    return res.data;
  }

  async getData(search: OrderItemSearch = {}): Promise<DataResponse<PagedList<OrderItemDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: OrderItemRequest): Promise<DataResponse<OrderItemDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: OrderItemRequest): Promise<DataResponse<OrderItemDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
    return res.data;
  }
}

export default OrderItemServiceGenerated;
