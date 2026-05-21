export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  userName?: string;
  password?: string;
  roleName?: string;
}

export interface ForgotPasswordRequest {
  email?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  token?: string;
  newPassword?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}
