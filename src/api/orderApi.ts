import { HttpClient } from "../shared/http/httpClient";
import { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "orders";

export interface IOrderDetails {
  orderCode: string;
  amount: number;
  offerCode?: string;
  discountAmount?: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  qrCodeUrl: string;
  expired?: number;
  productIds?: string[];
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateOrderPayload {
  amount: number;
  productIds: string[];
  offerCode?: string;
}

export interface IFirstPurchaseResponse {
  isFirstPurchase: boolean;
}

export const OrderService = {
  checkFirstPurchase: async (): Promise<BaseApiResponse<IFirstPurchaseResponse> | undefined> => {
    try {
      const response = await HttpClient.get<IFirstPurchaseResponse>(
        `${BASE_URL}/first-purchase`,
      );
      return response;
    } catch (error: any) {
      return undefined;
    }
  },

  createOrder: async (
    amount: number,
    productIds: string[],
    offerCode?: string,
  ): Promise<BaseApiResponse<IOrderDetails> | undefined> => {
    try {
      const payload: ICreateOrderPayload = {
        amount,
        productIds,
        ...(offerCode?.trim() ? { offerCode: offerCode.trim() } : {}),
      };
      const response = await HttpClient.post<IOrderDetails, ICreateOrderPayload>(
        BASE_URL,
        payload,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create order");
    }
  },

  getLatestOrder: async (amount: number, length: number): Promise<BaseApiResponse<IOrderDetails | null> | undefined> => {
    try {
      const response = await HttpClient.get<IOrderDetails | null>(
        `${BASE_URL}/latest?totalAmount=${amount}&length=${length}`,
      );
      return response;
    } catch (error: any) {
      return undefined;
    }
  },

  getOrderStatus: async (
    orderCode: string,
  ): Promise<BaseApiResponse<IOrderDetails> | undefined> => {
    try {
      const response = await HttpClient.get<IOrderDetails>(
        `${BASE_URL}/${orderCode}`,
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch order status");
    }
  },
};
