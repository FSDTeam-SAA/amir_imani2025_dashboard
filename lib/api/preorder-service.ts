import axiosInstance from "./axios-instance";
import {
  Preorder,
  PreordersResponse,
  UpdatePreorderStatusRequest,
} from "../types/preorder";

export const preorderService = {
  getAll: async (params?: {
    search?: string;
    status?: string;
  }): Promise<Preorder[]> => {
    const response = await axiosInstance.get<PreordersResponse>("/preorders", {
      params,
    });
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    payload: UpdatePreorderStatusRequest
  ): Promise<Preorder> => {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
      data: Preorder;
    }>(`/preorders/${id}/status`, payload);
    return response.data.data;
  },
};
