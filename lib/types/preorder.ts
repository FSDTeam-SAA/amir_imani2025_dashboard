export type PreorderStatus = "pending" | "completed";

export interface Preorder {
  _id: string;
  productId: string;
  userId: string;
  productName: string;
  userName: string;
  userEmail: string;
  productType?: string;
  category?: string;
  status: PreorderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PreordersResponse {
  success: boolean;
  message: string;
  data: Preorder[];
}

export interface UpdatePreorderStatusRequest {
  status: PreorderStatus;
}
