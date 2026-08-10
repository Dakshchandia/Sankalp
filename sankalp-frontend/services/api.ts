import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, TOKEN_KEY } from "@/lib/constants";

/**
 * Configured Axios instance for all SANKALP API requests.
 * Handles authentication headers and error normalization.
 */
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      Cookies.remove(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;

/** Helper for multipart form data (file uploads) */
export function createFormDataRequest(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return formData;
}
