import axiosInstance from "../axiosInstance";
import type { SellerDto } from "../../types/seller/dto";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

export interface SellerCreateRequest {
  userId?: string;
  businessName?: string;
  taxCode?: string;
}

export interface SellerUpdateRequest {
  id?: string;
  userId?: string;
  businessName?: string;
  taxCode?: string;
}

class SellerServiceGenerated {
  protected readonly BASE = "/api/Seller";

  async getMe(): Promise<DataResponse<SellerDto>> {
    const res = await axiosInstance.get(`${this.BASE}/me`);
    return res.data;
  }

  async create(request: SellerCreateRequest): Promise<DataResponse<SellerDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: SellerUpdateRequest): Promise<DataResponse<SellerDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(search: { userId?: string } = {}): Promise<DataResponse<SellerDto[]>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }
}

export default SellerServiceGenerated;
