import { HttpClient } from "../shared/http/httpClient";
import { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "products";

export type ProductQueryParams = {
  searchQuery?: string;
  page?: number;
  limit?: number | null;
  orderByPrice?: "asc" | "desc";
  disabled?: boolean;
};

export interface IPricing {
  vnd: string;
  usd: string;
  cny: string;
}

export interface IDlc {
  id: string;
  appId: number;
  name: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  imageUrl: string;
  categories: string[];
  prices: IPricing;
  description?: string;
  publisher?: string;
}

export interface IProductDetail {
  id: string;
  appId: number;
  name: string;
  description: string;
  imageUrl: string;
  pricing: IPricing;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  categories: string[];
  type?: IType;
  platforms: string[];
  dlcs: IDlc[];
  disabled: boolean;
  isDelete?: boolean;
  invisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IType {
  id: string;
  name: string;
}

export interface IPaginatedProducts {
  items: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPurchaseProductPayload {
  productIds: string[];
}

/**
 * Filter condition requirement:
 * 1. Product must not be deleted / disabled / invisible (isDelete === false, disabled === false, invisible === false)
 * 2. Product must have complete pricing across 3 supported currencies (vnd, usd, cny > 0)
 */
export const isValidProduct = (item: IProduct | IProductDetail): boolean => {
  if (!item) return false;
  if ((item as IProductDetail).isDelete || (item as IProductDetail).disabled) return false;

  const prices = (item as IProduct).prices || (item as IProductDetail).pricing;
  if (!prices) return false;

  const vnd = Number(prices.vnd || 0);
  const usd = Number(prices.usd || 0);
  const cny = Number(prices.cny || 0);

  return vnd >= 0 && usd >= 0 && cny >= 0;
};

export const ProductService = {
  get: async ({
    searchQuery,
    limit,
    page = 1,
    orderByPrice,
  }: ProductQueryParams = {}): Promise<BaseApiResponse<IPaginatedProducts> | undefined> => {
    try {
      const response = await HttpClient.get<IPaginatedProducts>(BASE_URL, {
        params: {
          page,
          ...(limit !== undefined ? { limit } : {}),
          ...(searchQuery?.trim() ? { search: searchQuery.trim() } : {}),
          ...(orderByPrice ? { orderByPrice } : {}),
        },
      });

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getById: async (id: string): Promise<BaseApiResponse<IProductDetail> | undefined> => {
    try {
      const response = await HttpClient.get<IProductDetail>(`${BASE_URL}/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  purchase: async (
    payload: IPurchaseProductPayload,
  ): Promise<BaseApiResponse<IProduct> | undefined> => {
    try {
      const response = await HttpClient.post<IProduct>(
        `${BASE_URL}/purchase`,
        { productIds: payload.productIds }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
