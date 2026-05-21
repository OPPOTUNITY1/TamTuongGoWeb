import axiosInstance from "../axiosInstance";
import type { UserInformationDto } from "../../types/userInformation/dto";
import type { UserInformationRequest, UserInformationSearch } from "../../types/userInformation/request";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class UserInformationServiceGenerated {
  protected readonly BASE = "/api/UserInformation";

  async create(request: UserInformationRequest): Promise<DataResponse<UserInformationDto>> {
    const res = await axiosInstance.post(`${this.BASE}/Create`, request);
    return res.data;
  }

  async update(request: UserInformationRequest): Promise<DataResponse<UserInformationDto>> {
    const res = await axiosInstance.put(`${this.BASE}/Update`, request);
    return res.data;
  }

  async getData(search : UserInformationSearch): Promise<DataResponse<UserInformationDto[]>> {
    const res = await axiosInstance.post(`${this.BASE}/GetData`, search);
    return res.data;
  }

  async get(id: string): Promise<DataResponse<UserInformationDto>> {
    const res = await axiosInstance.get(`${this.BASE}/Get/${id}`);
    return res.data;
  }

  async delete(id: string): Promise<DataResponse<boolean>> {
    const res = await axiosInstance.delete(`${this.BASE}/Delete`, { params: { id } });
    return res.data;
  }
}

export default UserInformationServiceGenerated;
