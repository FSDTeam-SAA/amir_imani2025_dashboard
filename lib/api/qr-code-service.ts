import axiosInstance from "./axios-instance";
import type {
  QRCode,
  CreateQRCodeInput,
  UpdateQRCodeInput,
  PaginatedQRCodeResponse,
} from "../types/qr-code";

export const qrCodeService = {
  // Fetch all QR codes with pagination and filters
  list: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    status?: string,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
  ): Promise<PaginatedQRCodeResponse> => {
    const response = await axiosInstance.get<PaginatedQRCodeResponse>(
      "/qrcodes",
      {
        params: {
          page,
          pageSize,
          search,
          status,
          sortBy,
          sortOrder,
        },
      }
    );
    return response.data;
  },

  // Get single QR code by ID
  getById: async (id: string): Promise<{ data: QRCode }> => {
    const response = await axiosInstance.get<{ data: QRCode }>(
      `/qrcodes/${id}`
    );
    return response.data;
  },

  // Create new QR code
  create: async (input: CreateQRCodeInput): Promise<{ data: QRCode }> => {
    const response = await axiosInstance.post<{ data: QRCode }>(
      "/qrcodes",
      input
    );
    return response.data;
  },

  // Update existing QR code
  update: async (
    id: string,
    input: UpdateQRCodeInput
  ): Promise<{ data: QRCode }> => {
    const response = await axiosInstance.patch<{ data: QRCode }>(
      `/qrcodes/${id}`,
      input
    );
    return response.data;
  },

  // Delete QR code
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(
      `/qrcodes/${id}`
    );
    return response.data;
  },

  // Generate QR code preview
  // generatePreview: async (gameLink: string): Promise<{ data: string }> => {
  //   const response = await axiosInstance.post<{ data: string }>('/qrcodes/preview', {
  //     gameLink,
  //   })
  //   return response.data
  // },
};
