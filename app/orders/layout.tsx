"use client";

import { Sidebar } from "@/components/qr-code/sidebar";
import { signOut } from "next-auth/react";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
