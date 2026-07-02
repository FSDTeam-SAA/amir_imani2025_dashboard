import VerifyOTP from "@/components/Auth/VerifyOTP/VerifyOTP";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div>
      <Suspense>
        <VerifyOTP />
      </Suspense>
    </div>
  );
}
