import axiosInstance from "../axiosInstance";
import type { CartDto } from "../../types/cart/dto";
import type { CartRequest, CartSearch } from "../../types/cart/request";
import type { PagedList } from "./productImage.generate";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class CartServiceGenerated {
  protected readonly BASE = "/api/Cart";

  async create(request: CartRequest): Promise<DataResponse<CartDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: CartRequest): Promise<DataResponse<CartDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(search: CartSearch = {}): Promise<DataResponse<PagedList<CartDto>>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async get(id: string): Promise<DataResponse<CartDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Getdata/${id}`);
    return res.data;
  }

  async remove(id: string): Promise<DataResponse<CartDto>> {
    const res = await axiosInstance.delete(`${this.BASE}/Remove/${id}`);
    return res.data;
  }
}

export default CartServiceGenerated;
