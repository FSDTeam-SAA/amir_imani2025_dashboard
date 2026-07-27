export type PreorderStatus = "pending" | "completed";

export interface Preorder {
  _id: string;
  productId:
    | string
    | {
        _id: string;
        productName?: string;
        imgs?: string[];
      };
  userId: string;
  productName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  productType?: string;
  category?: string;
  productImage?: string;
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
