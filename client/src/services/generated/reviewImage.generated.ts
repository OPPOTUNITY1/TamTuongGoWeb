import axiosInstance from "../axiosInstance";
import type { ReviewImageDto } from "../../types/reviewImage/dto";
import type { ReviewImageRequest, ReviewImageSearch } from "../../types/reviewImage/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class ReviewImageServiceGenerated {
  protected readonly BASE = "/api/ReviewImage";

  async get(id: string): Promise<DataResponse<ReviewImageDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async getData(search: ReviewImageSearch = {}): Promise<DataResponse<PagedList<ReviewImageDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/Getdata`, search);
    return res.data;
  }

  async create(request: ReviewImageRequest): Promise<DataResponse<ReviewImageDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: ReviewImageRequest): Promise<DataResponse<ReviewImageDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete`, { params: { id } });
    return res.data;
  }
}

export default ReviewImageServiceGenerated;
