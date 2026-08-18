import { HttpClient } from "../shared/http/httpClient";
import { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "products";

export type ProductQueryParams = {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
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
  appId: number;
  name: string;
  description: string;
  imageUrl: string;
  pricing: IPricing;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  categories: string[];
  type?: string;
  platforms: string[];
  dlcs: IDlc[];
  disabled: boolean;
  isDelete?: boolean;
  invisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
export const isValidProduct = (item: IProduct): boolean => {
  if (!item) return false;
  if (item.isDelete || item.invisible || item.disabled) return false;

  const { pricing } = item;
  if (!pricing) return false;

  const vnd = Number(pricing.vnd || 0);
  const usd = Number(pricing.usd || 0);
  const cny = Number(pricing.cny || 0);

  return vnd > 0 && usd > 0 && cny > 0;
};

export const ProductService = {
  get: async ({
    searchQuery,
    page = 1,
    pageSize = 10,
    includeHidden = false,
  }: ProductQueryParams = {}): Promise<BaseApiResponse<IPaginatedProducts> | undefined> => {
    try {
      const response = await HttpClient.get<IPaginatedProducts>(BASE_URL, {
        params: {
          includeHidden,
          page,
          pageSize,
          ...(searchQuery?.trim() ? { search: searchQuery.trim() } : {}),
        },
      });

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  getById: async (id: string): Promise<BaseApiResponse<IProduct> | undefined> => {
    try {
      const response = await HttpClient.get<IProduct>(`${BASE_URL}/${id}`);
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
