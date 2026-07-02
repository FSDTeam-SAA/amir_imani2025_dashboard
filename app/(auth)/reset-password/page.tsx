// import ChangePassword from "@/components/Auth/ForgetPassword/ForgetPassword";
import ResetPassword from "@/components/Auth/ResetPassword/ResetPassword";
import React, { Suspense } from "react";

export default function page() {
  return (
    <div>
      <Suspense>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
