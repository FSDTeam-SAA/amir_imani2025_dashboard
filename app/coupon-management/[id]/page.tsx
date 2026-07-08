"use client";

import { useParams } from "next/navigation";
import CouponFormPage from "@/components/coupon/coupon-form-page";

export default function EditCouponPage() {
  const params = useParams<{ id: string }>();

  return <CouponFormPage mode="edit" couponId={params.id} />;
}
