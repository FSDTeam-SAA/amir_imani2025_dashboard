import axiosInstance from "./axios-instance";
import type { ApiResponse, Coupon, CouponPayload } from "@/lib/types/coupon";

export const couponService = {
  getAll: async (status: "active" | "expired" | "all" = "all") => {
    const response = await axiosInstance.get<ApiResponse<Coupon[]>>(
      `/coupons?status=${status}`
    );

    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Coupon>>(
      `/coupons/${id}`
    );

    return response.data;
  },

  create: async (payload: CouponPayload) => {
    const response = await axiosInstance.post<ApiResponse<Coupon>>(
      "/coupons",
      payload
    );

    return response.data;
  },

  update: async (id: string, payload: Partial<CouponPayload>) => {
    const response = await axiosInstance.put<ApiResponse<Coupon>>(
      `/coupons/${id}`,
      payload
    );

    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/coupons/${id}`
    );

    return response.data;
  },
};

