export type ReviewStatus = "pending" | "published" | "rejected";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  review: string;
  status: ReviewStatus;
  userName: string;
  userEmail: string;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
}

export interface UpdateReviewStatusRequest {
  status: ReviewStatus;
}
