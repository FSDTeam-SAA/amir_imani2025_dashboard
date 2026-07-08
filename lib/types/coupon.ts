export type CouponDiscountType = "percentage" | "fixed";
export type CouponEligibility = "all" | "first_time" | "specific";

export type Coupon = {
  _id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountCap?: number;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  expiryDate: string;
  eligibility: CouponEligibility;
  eligibleUsers: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponPayload = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountCap?: number;
  usageLimit: number;
  perUserLimit?: number;
  expiryDate: string;
  eligibility?: CouponEligibility;
  eligibleUsers?: string[];
  isActive?: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

