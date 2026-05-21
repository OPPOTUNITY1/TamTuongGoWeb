import axiosInstance from "../axiosInstance";
import type { ProductImageDto } from "../../types/productImage/dto";
import type { ProductImageRequest, ProductImageSearch } from "../../types/productImage/reqeust";

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

class ProductImageServiceGenerated {
	protected readonly BASE = "/api/ProductImage";

	async create(request: ProductImageRequest): Promise<DataResponse<ProductImageDto>> {
		const res = await axiosInstance.post(`${this.BASE}/Create`, request);
		return res.data;
	}

	async update(request: ProductImageRequest): Promise<DataResponse<ProductImageDto>> {
		const res = await axiosInstance.put(`${this.BASE}/Update`, request);
		return res.data;
	}

	async delete(id: string): Promise<DataResponse<boolean>> {
		const res = await axiosInstance.delete(`${this.BASE}/Delete/${id}`);
		return res.data;
	}

	async getData(search: ProductImageSearch = {}): Promise<DataResponse<PagedList<ProductImageDto>>> {
		const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
		return res.data;
	}

	async get(id: string): Promise<DataResponse<ProductImageDto>> {
		const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
		return res.data;
	}
}

export default ProductImageServiceGenerated;
