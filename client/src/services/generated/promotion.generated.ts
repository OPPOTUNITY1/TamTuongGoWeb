import axiosInstance from "../axiosInstance";
import type { PromotionDto } from "../../types/promotion/dto";
import type { PromotionRequest, PromotionSearch } from "../../types/promotion/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class PromotionServiceGenerated {
  protected readonly BASE = "/api/Promotion";

  async get(id: string): Promise<DataResponse<PromotionDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async getData(search: PromotionSearch = {}): Promise<DataResponse<PagedList<PromotionDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: PromotionRequest): Promise<DataResponse<PromotionDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: PromotionRequest): Promise<DataResponse<PromotionDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
    return res.data;
  }
}

export default PromotionServiceGenerated;
