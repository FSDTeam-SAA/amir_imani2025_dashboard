"use client";

import { Sidebar } from "@/components/qr-code/sidebar";
import { signOut } from "next-auth/react";

export default function PreordersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
