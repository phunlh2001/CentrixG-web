import { HttpClient } from "../shared/http/httpClient";
import type { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "affiliate";

export interface ISocialChannel {
  platform: string;
  url: string;
}

export interface IAffiliateApplyPayload {
  fullName: string;
  phoneNumber: string;
  socialChannels: ISocialChannel[];
  promotionPlan: string;
  achievements: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  offerCode: string;
}

export interface IAffiliateApplyResponse {
  offerCode?: string;
  status?: string;
  message?: string;
  createdAt?: string;
  [key: string]: any;
}

export type AffiliateStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export interface IAffiliateMeResponse {
  offerCode: string | null;
  totalEarn: number;
  status: AffiliateStatus;
  [key: string]: any;
}

// Backward compatibility alias
export type IAffiliateRegisterPayload = IAffiliateApplyPayload;
export type IAffiliateRegisterResponse = IAffiliateApplyResponse;

export const AffiliateService = {
  apply: async (
    payload: IAffiliateApplyPayload
  ): Promise<BaseApiResponse<IAffiliateApplyResponse> | undefined> => {
    try {
      const response = await HttpClient.post<
        IAffiliateApplyResponse,
        IAffiliateApplyPayload
      >(`${BASE_URL}/apply`, payload);
      return response;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit affiliate application."
      );
    }
  },

  getMe: async (): Promise<IAffiliateMeResponse | null> => {
    try {
      const response = await HttpClient.get<IAffiliateMeResponse>(`${BASE_URL}/me`);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  register: async (
    payload: IAffiliateApplyPayload
  ): Promise<BaseApiResponse<IAffiliateApplyResponse> | undefined> => {
    return AffiliateService.apply(payload);
  },
};
