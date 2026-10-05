import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Utils } from "../utils";
import {
  ApiError,
  ApiResult,
  BaseApiResponse,
  HttpClientConfig,
  RequestConfig,
} from "./types";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
if (!BASE_API_URL) {
  throw new Error("VITE_BASE_API_URL is not defined");
}

let refreshPromise: Promise<string | null> | null = null;

const executeRefreshToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  const refreshToken =
    Utils.cookie.read("refreshToken") || localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const refreshRes = await axios.post(`${BASE_API_URL}/auth/refresh-token`, {
        refreshToken,
      });
      const body = refreshRes.data;
      const payload = body?.data || body;

      if (payload?.accessToken) {
        const days = payload.expiresIn ? payload.expiresIn / 86400 || 7 : 7;

        Utils.cookie.create("accessToken", payload.accessToken, days);
        if (payload.refreshToken) {
          Utils.cookie.create("refreshToken", payload.refreshToken, days);
        }
        if (payload.expiresIn) {
          Utils.cookie.create("expiresIn", String(payload.expiresIn), days);
        }

        // Decode user claims from new access token
        const jwtUser = Utils.jwt.decode(payload.accessToken);
        if (jwtUser) {
          const role = (jwtUser.role || "CUSTOMER") as string;
          const isSeller = role?.toUpperCase() === "SELLER";
          const totalEarn = jwtUser.affiliate?.totalEarn ?? jwtUser.totalEarn ?? 0;
          const offerCode = jwtUser.affiliate?.offerCode ?? jwtUser.offerCode ?? null;

          const userObj = {
            id: jwtUser.id || jwtUser.sub || "",
            username: jwtUser.username || "",
            email: jwtUser.email || "",
            role: role,
            isBlock: jwtUser.isBlocked ?? jwtUser.isBlock ?? false,
            isSeller: isSeller,
            totalEarn: typeof totalEarn === "number" ? totalEarn : Number(totalEarn) || 0,
            offerCode: offerCode,
          };
          Utils.cookie.create("authUser", JSON.stringify(userObj), days);
        }

        window.dispatchEvent(new Event("auth-session-changed"));
        return payload.accessToken as string;
      }
      return null;
    } catch {
      Utils.cookie.clear("accessToken");
      Utils.cookie.clear("refreshToken");
      Utils.cookie.clear("expiresIn");
      Utils.cookie.clear("authUser");
      window.dispatchEvent(new Event("auth-session-changed"));
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const createInstance = (config: HttpClientConfig = {}): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: config.baseURL || BASE_API_URL,
    timeout: config.timeout ? config.timeout : 15000,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    withCredentials: config.withCredentials,
  });

  setupInterceptors(axiosInstance, config.getAccessToken);
  return axiosInstance;
};

const setupInterceptors = (
  axiosInstance: AxiosInstance,
  getAccessToken?: () => string | null,
) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken?.() || Utils.cookie.read("accessToken");
      if (token && (config as any).requiresAuth !== false) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: ApiError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const newAccessToken = await executeRefreshToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      }

      return Promise.reject(handleError(error));
    },
  );
};

const handleError = (error: ApiError): ApiError => {
  const status = error.response?.status;
  const rawMsg = error.response?.data?.message || error.response?.data?.error;
  let message = "";

  // 1. Display exact response message if present
  if (Array.isArray(rawMsg)) {
    message = rawMsg.join(". ");
  } else if (typeof rawMsg === "string" && rawMsg.trim()) {
    message = rawMsg.trim();
  }

  // 2. Handle 500+ server errors with a legitimate, customer-friendly message instead of raw tracebacks
  if (status && status >= 500) {
    message = "Hệ thống đang gián đoạn dịch vụ tạm thời. Vui lòng thử lại sau ít phút.";
  }

  // 3. Fallback error message
  if (!message) {
    message = error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }

  return { ...error, message } as ApiError;
};

const formatResponse = <T>(
  response: AxiosResponse<ApiResult<T>>,
): BaseApiResponse<T> => {
  const result = response.data;
  return {
    data: result.data,
    statusCode: result.statusCode,
    success: result.success ?? result.sucess ?? false,
    message: result.message,
  };
};

// ==================== PUBLIC API ====================

export const createHttpClient = (config: HttpClientConfig = {}) => {
  const axiosInstance = createInstance(config);

  return {
    get: async <T>(
      url: string,
      config?: RequestConfig,
    ): Promise<BaseApiResponse<T>> => {
      const res = await axiosInstance.get<ApiResult<T>>(url, config);

      return formatResponse(res);
    },

    post: async <T, D = unknown>(
      url: string,
      payload?: D,
      config?: RequestConfig,
    ): Promise<BaseApiResponse<T>> => {
      const res = await axiosInstance.post<ApiResult<T>>(url, payload, config);
      return formatResponse(res);
    },

    put: async <T, D = unknown>(
      url: string,
      payload?: D,
      config?: RequestConfig,
    ): Promise<BaseApiResponse<T>> => {
      const res = await axiosInstance.put<ApiResult<T>>(url, payload, config);
      return formatResponse(res);
    },

    patch: async <T>(
      url: string,
      data?: unknown,
      config?: RequestConfig,
    ): Promise<BaseApiResponse<T>> => {
      const res = await axiosInstance.patch<ApiResult<T>>(url, data, config);
      return formatResponse(res);
    },

    delete: async <T>(
      url: string,
      config?: RequestConfig,
    ): Promise<BaseApiResponse<T>> => {
      const res = await axiosInstance.delete<ApiResult<T>>(url, config);
      return formatResponse(res);
    },

    getAxiosInstance: () => axiosInstance,
  };
};

const getAccessToken = () =>
  Utils.cookie.read("accessToken") || localStorage.getItem("accessToken");

export const HttpClient = createHttpClient({
  baseURL: BASE_API_URL,
  getAccessToken,
});
