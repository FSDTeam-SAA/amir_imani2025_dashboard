export interface QRCode {
  _id: string;
  gameName: string;
  finalUrl: string;
  qrCode: string; // Base64 or URL to QR code image
  // status: 'Active' | 'Inactive'
  // linkStatus: 'active' | 'inactive'
  createdAt: string;
  updatedAt: string;
}

export interface CreateQRCodeInput {
  gameName: string;
  finalUrl: string;
  // linkStatus: 'active' | 'inactive'
}

export interface UpdateQRCodeInput {
  gameName: string;
  finalUrl: string;
  // linkStatus: 'active' | 'inactive'
}

export interface QRCodeResponse {
  success: boolean;
  data?: QRCode | QRCode[];
  message?: string;
  error?: string;
}

export interface PaginatedQRCodeResponse {
  success: boolean;
  data: QRCode[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}

export type ViewMode = "list" | "grid";
export type SortField = "gameName" | "createdAt" | "status";
export type SortOrder = "asc" | "desc";
