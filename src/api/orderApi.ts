import { HttpClient } from "../shared/http/httpClient";
import { BaseApiResponse } from "../shared/http/types";

const BASE_URL = "orders";

export interface IOrderDetails {
  orderCode: string;
  amount: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  qrCodeUrl: string;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateOrderPayload {
  amount: number;
}

export const OrderService = {
  createOrder: async (amount: number): Promise<BaseApiResponse<IOrderDetails> | undefined> => {
    try {
      const response = await HttpClient.post<IOrderDetails, ICreateOrderPayload>(
        BASE_URL,
        { amount },
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create order");
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
