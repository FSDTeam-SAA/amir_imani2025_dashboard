import axiosInstance from "./axios-instance";
import {
  ReviewsResponse,
  Review,
  ReviewStatus,
  UpdateReviewStatusRequest,
} from "../types/review";

export const reviewService = {
  getAll: async (params?: {
    search?: string;
    status?: string;
  }): Promise<Review[]> => {
    const response = await axiosInstance.get<ReviewsResponse>("/reviews", {
      params,
    });
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    payload: UpdateReviewStatusRequest
  ): Promise<Review> => {
    const response = await axiosInstance.patch<{
      success: boolean;
      message: string;
      data: Review;
    }>(`/reviews/${id}/status`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/reviews/${id}`);
  },
};
