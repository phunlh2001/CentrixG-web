import { HttpClient } from "../shared/http/httpClient";
import type { BaseApiResponse } from "../shared/http/types";
import type { IDlc, IPricing } from "./productApi";

const BASE_URL = "user/games";

export type UserGameStatus = "ACTIVE" | "PENDING" | "EXPIRED" | string;

export interface IUserProduct {
  id: string;
  appId: number;
  name: string;
  description?: string;
  imageUrl: string;
  pricing?: IPricing;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  categories?: string[];
  platforms?: string[];
  dlcs?: IDlc[];
  disabled?: boolean;
  isDelete?: boolean;
  invisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserManifest {
  id: string;
  appId: number;
  depotId: number;
  manifestId: string;
  manifestData: string;
  luaScript: string;
  version: number;
  isEnabled: boolean;
}

export interface IUserGame {
  id: string;
  userId: string;
  productId: string;
  product: IUserProduct;
  manifestId: string;
  manifest: IUserManifest;
  rentedAt: string;
  expiresAt: string;
  status: UserGameStatus;
  rentalPrice: string;
  rentalCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISendResetCodePayload {
  email: string;
}

export interface ISendResetCodeResponse {
  email: string;
  hashedCode: string;
  message: string;
}

export interface IResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export const UserService = {
  get: async (): Promise<BaseApiResponse<IUserGame[]> | undefined> => {
    try {
      const response = await HttpClient.get<IUserGame[]>(BASE_URL);
      return response;
    } catch (error) {
      console.error("Failed to fetch user User API:", error);
      return undefined;
    }
  },

  sendResetCode: async (
    payload: ISendResetCodePayload,
  ): Promise<BaseApiResponse<ISendResetCodeResponse> | undefined> => {
    try {
      const response = await HttpClient.post<ISendResetCodeResponse, ISendResetCodePayload>(
        "user/send-reset-code",
        payload,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to send verification code");
    }
  },

  resetPassword: async (
    payload: IResetPasswordPayload,
  ): Promise<BaseApiResponse<IResetPasswordResponse> | undefined> => {
    try {
      const response = await HttpClient.post<IResetPasswordResponse, IResetPasswordPayload>(
        "user/reset-password",
        payload,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to reset password");
    }
  },
};
