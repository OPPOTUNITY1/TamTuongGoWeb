import axiosInstance from "../axiosInstance";
import type { ShopDto } from "../../types/shop/dto";
import type { ShopRequestDto, ShopSearchDto } from "../../types/shop/request";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

export interface PagedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

class ShopServiceGenerated {
  protected readonly BASE = "/api/Shop";

  async create(request: ShopRequestDto): Promise<DataResponse<ShopDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: ShopRequestDto): Promise<DataResponse<ShopDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(search: ShopSearchDto = {}): Promise<DataResponse<PagedList<ShopDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async get(id: string): Promise<DataResponse<ShopDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete`, { params: { id } });
    return res.data;
  }
}

export default ShopServiceGenerated;
