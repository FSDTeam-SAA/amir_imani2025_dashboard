import axiosInstance from "./axios-instance";
import type {
  NotifySubscribersPayload,
  NotifySubscribersResult,
  Subscriber,
  SubscribersResponse,
} from "../types/subscriber";

export const subscriberService = {
  getAll: async (): Promise<Subscriber[]> => {
    const response = await axiosInstance.get<SubscribersResponse>("/subscribers");
    return response.data.data;
  },

  notify: async (
    payload: NotifySubscribersPayload
  ): Promise<NotifySubscribersResult> => {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
      data: NotifySubscribersResult;
    }>("/subscribers/notify", payload);

    return response.data.data;
  },
};
