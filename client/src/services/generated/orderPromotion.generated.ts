import axiosInstance from "../axiosInstance";
import type { OrderPromotionDto } from "../../types/orderPromotion/dto";
import type { OrderPromotionRequest, OrderPromotionSearch } from "../../types/orderPromotion/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class OrderPromotionServiceGenerated {
  protected readonly BASE = "/api/OrderPromotion";

  async get(id: string): Promise<DataResponse<OrderPromotionDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async getData(search: OrderPromotionSearch = {}): Promise<DataResponse<PagedList<OrderPromotionDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: OrderPromotionRequest): Promise<DataResponse<OrderPromotionDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: OrderPromotionRequest): Promise<DataResponse<OrderPromotionDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
    return res.data;
  }
}

export default OrderPromotionServiceGenerated;
