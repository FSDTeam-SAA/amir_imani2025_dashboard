"use client";

import { Sidebar } from "@/components/qr-code/sidebar";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { signOut } from "next-auth/react";

export default function BlogsLayout({
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
      {/* Desktop Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Header (Hidden on Desktop usually handled inside page but here we wrap content) */}
        {/* Since Sidebar component is fixed, we can just render the content area. 
            However, MobileSidebar is usually inside the header of the page content.
            We will let the page handle the header to be consistent with the dashboard page pattern,
            OR we can put a common header here.
            The dashboard page puts the header inside the page component. 
            To remain consistent and allow page-specific headers, we'll just render children here, 
            but we MUST include the wrapper div `flex h-screen` and Sidebar.
        */}
        {children}
      </main>
    </div>
  );
}
