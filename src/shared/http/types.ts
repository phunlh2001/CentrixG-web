import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export interface BaseApiResponse<T = any> {
  data: T;
  success: boolean;
  statusCode: number;
  message?: string;
}

export interface ApiResult<T = any> {
  data: T;
  statusCode: number;
  success?: boolean;
  sucess?: boolean;
  message?: string;
}

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  getAccessToken?: () => string | null;
}

export type RequestConfig = Omit<AxiosRequestConfig, "baseURL"> & {
  requiresAuth?: boolean;
  params?: Record<string, any>;
};

export interface ApiError extends AxiosError {
  response?: AxiosResponse & {
    data?: {
      message?: string;
      error?: string;
      errors?: any;
      statusCode?: number;
      success?: boolean;
    };
  };
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
