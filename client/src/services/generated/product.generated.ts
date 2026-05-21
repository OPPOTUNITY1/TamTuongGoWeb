import axiosInstance from "../axiosInstance";
import type { ProductDto } from "../../types/product/dto";
import type { ProductRequestDto, ProductSearchDto } from "../../types/product/request";
import type { PagedList } from "./shop.generated";

interface DataResponse<T> {
  data?: T;
  status: boolean;
  message?: string;
}

class ProductServiceGenerated {
  protected readonly BASE = "/api/Product";

  async create(request: ProductRequestDto): Promise<DataResponse<ProductDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: ProductRequestDto): Promise<DataResponse<ProductDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(
    search: ProductSearchDto = {}
  ): Promise<DataResponse<PagedList<ProductDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async getByShop(shopId: string): Promise<DataResponse<ProductDto[]>> {
    const res = await axiosInstance.get(`${this.BASE}/GetByShop/${shopId}`);
    return res.data;
  }

  async get(id: string): Promise<DataResponse<ProductDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<null>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete`, {
      params: { id },
    });
    return res.data;
  }
}

export default ProductServiceGenerated;
