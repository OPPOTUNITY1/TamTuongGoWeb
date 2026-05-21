import axiosInstance from "../axiosInstance";
import type { CategoryDto } from "../../types/category/dto";
import type { CategoryRequestDto, CategorySearchDto } from "../../types/category/request";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class CategoryServiceGenerated {
  protected readonly BASE = "/api/Category";

  async create(request: CategoryRequestDto): Promise<DataResponse<CategoryDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: CategoryRequestDto): Promise<DataResponse<CategoryDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(search: CategorySearchDto = {}): Promise<DataResponse<CategoryDto[]>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async get(id: string): Promise<DataResponse<CategoryDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete`, { params: { id } });
    return res.data;
  }
}

export default CategoryServiceGenerated;
