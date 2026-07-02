"use client";

import { ReactNode } from "react";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  onLogout: () => void;
  children?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  actionLabel,
  onAction,
  onLogout,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="bg-[#eeeeee] p-4 md:p-6 border-b border-black/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="md:hidden">
            <MobileSidebar onLogout={onLogout} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold bg-[#F04D2A] bg-clip-text text-transparent font-heading truncate">
              {title}
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
              {description}
            </p>
          </div>
        </div>

        {actionLabel && onAction ? (
          <Button
            onClick={onAction}
            className="bg-foreground text-[#eeeeee] hover:bg-foreground/80 hover:text-white border-none cursor-pointer duration-300 font-heading whitespace-nowrap text-sm md:text-base px-3 md:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">New</span>
          </Button>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}
