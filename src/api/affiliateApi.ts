import { HttpClient } from "../shared/http/httpClient";
import type { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "affiliates";

export interface IAffiliateRegisterPayload {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  offerCode: string;
}

export interface IAffiliateRegisterResponse {
  offerCode: string;
  username: string;
  status?: string;
  createdAt?: string;
}

export const AffiliateService = {
  register: async (
    payload: IAffiliateRegisterPayload
  ): Promise<BaseApiResponse<IAffiliateRegisterResponse> | undefined> => {
    try {
      const response = await HttpClient.post<
        IAffiliateRegisterResponse,
        IAffiliateRegisterPayload
      >(`${BASE_URL}/register`, payload);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to register affiliate partner.");
    }
  },
};
