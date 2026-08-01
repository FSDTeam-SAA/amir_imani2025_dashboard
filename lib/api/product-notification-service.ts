import axiosInstance from "./axios-instance";

export type ProductNotification = { _id: string; productName: string; productImage?: string; email: string; userName?: string; createdAt: string };

export const productNotificationService = {
  getAll: async (): Promise<ProductNotification[]> => (await axiosInstance.get<{ data: ProductNotification[] }>("/product-notifications")).data.data,
};
