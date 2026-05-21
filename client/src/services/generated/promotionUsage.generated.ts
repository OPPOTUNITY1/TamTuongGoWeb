import axiosInstance from "../axiosInstance";
import type { PromotionUsageDto } from "../../types/promotionUsage/dto";
import type { PromotionUsageRequest, PromotionUsageSearch } from "../../types/promotionUsage/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class PromotionUsageServiceGenerated {
  protected readonly BASE = "/api/PromotionUsage";

  async get(id: string): Promise<DataResponse<PromotionUsageDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async getData(search: PromotionUsageSearch = {}): Promise<DataResponse<PagedList<PromotionUsageDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: PromotionUsageRequest): Promise<DataResponse<PromotionUsageDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: PromotionUsageRequest): Promise<DataResponse<PromotionUsageDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
    return res.data;
  }
}

export default PromotionUsageServiceGenerated;
