import axiosInstance from "../axiosInstance";
import type { OrderDto } from "../../types/order/dto";
import type { OrderRequest, OrderSearch } from "../../types/order/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class OrderServiceGenerated {
  protected readonly BASE = "/api/Order";

  async get(id: string): Promise<DataResponse<OrderDto>> {
    const res = await axiosInstance.get(`${this.BASE}/${id}`);
    return res.data;
  }

  async getData(search: OrderSearch = {}): Promise<DataResponse<PagedList<OrderDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: OrderRequest): Promise<DataResponse<OrderDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: OrderRequest): Promise<DataResponse<OrderDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/${id}`);
    return res.data;
  }
}

export default OrderServiceGenerated;
