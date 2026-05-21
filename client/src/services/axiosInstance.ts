import axios from "axios";

const envUrlRaw = import.meta.env.VITE_API_URL ?? "";
const normalize = (u: string) => (u || "").replace(/\/$/, "");
let baseURL = "";
if (typeof window !== "undefined") {
  const origin = normalize(window.location.origin);
  const envUrl = normalize(envUrlRaw);
  // If env URL is not provided or equals the dev server origin, use relative paths (so Vite proxy works)
  baseURL = envUrl && envUrl !== origin ? envUrl : "";
} else {
  baseURL = normalize(envUrlRaw);
}

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extract a human-readable error message from an axios error or any thrown value */
export function extractApiError(err: unknown, fallback = "Đã xảy ra lỗi."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.message) return data.message as string;
    if (typeof data === "string") return data;
    if (err.response?.status === 401) return "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.";
    if (err.response?.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  }
  return fallback;
}

export default axiosInstance;
