import axiosInstance from "../axiosInstance";
import type { ReviewDto } from "../../types/review/dto";
import type { ReviewRequest, ReviewSearch } from "../../types/review/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class ReviewServiceGenerated {
  protected readonly BASE = "/api/Review";

  async get(id: string): Promise<DataResponse<ReviewDto>> {
    const res = await axiosInstance.get(`${this.BASE}/${id}`);
    return res.data;
  }

  async getData(search: ReviewSearch = {}): Promise<DataResponse<PagedList<ReviewDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async create(request: ReviewRequest): Promise<DataResponse<ReviewDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: ReviewRequest): Promise<DataResponse<ReviewDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
    return res.data;
  }
}

export default ReviewServiceGenerated;
