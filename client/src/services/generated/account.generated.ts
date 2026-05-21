import axiosInstance from "../axiosInstance";
import type { LoginResponseDto } from "../../types/account/dto";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../../types/account/request";

interface DataResponse<T = null> {
  data?: T;
  status: boolean;
  message?: string;
}

class AccountServiceGenerated {
  protected readonly BASE = "/api/Account";

  async login(request: LoginRequest): Promise<DataResponse<LoginResponseDto>> {
    const res = await axiosInstance.post(`${this.BASE}/login`, request);
    return res.data;
  }

  async register(request: RegisterRequest): Promise<DataResponse> {
    const res = await axiosInstance.post(`${this.BASE}/register`, request);
    return res.data;
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<DataResponse<string>> {
    const res = await axiosInstance.post(`${this.BASE}/forgot-password`, request);
    return res.data;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<DataResponse> {
    const res = await axiosInstance.post(`${this.BASE}/reset-password`, request);
    return res.data;
  }

  async updateProfile(request: UpdateProfileRequest): Promise<DataResponse> {
    const res = await axiosInstance.post(`${this.BASE}/update-profile`, request);
    return res.data;
  }

  async changePassword(request: ChangePasswordRequest): Promise<DataResponse> {
    const res = await axiosInstance.post(`${this.BASE}/change-password`, request);
    return res.data;
  }
}

export default AccountServiceGenerated;
