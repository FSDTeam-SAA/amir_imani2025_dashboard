import { Suspense } from "react";
import Login from "@/components/Auth/Login/Login";

export default function page() {
  return (
    <div>
      <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
        <Login />
      </Suspense>
    </div>
  );
}
