"use client";

import { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Send,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-gray-100 bg-white shadow-sm">
      {children}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
      {children}
    </div>
  );
}

interface PaginationFooterProps {
  from: number;
  to: number;
  total: number;
  pages?: number[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function PaginationFooter({
  from,
  to,
  total,
  pages = [1, 2, 3, 4, 5, 6],
  currentPage = 1,
  onPageChange,
}: PaginationFooterProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < pages[pages.length - 1];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
      <p>
        Showing {from} to {to} of {total} results
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          className="border-gray-200"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon-xs"
            className={cn(
              "border-gray-200 text-xs",
              page === currentPage
                ? "bg-[#F04D2A] text-white hover:bg-[#F04D2A]/90"
                : "bg-white text-gray-500"
            )}
            onClick={() => onPageChange?.(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon-xs"
          className="border-gray-200"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={!hasNext}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className =
    normalized.includes("active") ||
    normalized.includes("paid") ||
    normalized.includes("completed") ||
    normalized.includes("published") ||
    normalized.includes("fulfilled") ||
    normalized.includes("notified")
      ? "bg-emerald-50 text-emerald-600"
      : normalized.includes("pending") ||
          normalized.includes("scheduled") ||
          normalized.includes("review")
        ? "bg-amber-50 text-amber-600"
        : normalized.includes("blocked") ||
            normalized.includes("unsubscribed") ||
            normalized.includes("inactive") ||
            normalized.includes("cancelled") ||
            normalized.includes("expired") ||
            normalized.includes("rejected")
          ? "bg-rose-50 text-rose-600"
          : "bg-sky-50 text-sky-600";

  return (
    <Badge className={cn("border-0 px-2 py-0.5 text-[11px]", className)}>
      {status}
    </Badge>
  );
}

interface ActionButtonsProps {
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onNotify?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({
  onView,
  onApprove,
  onReject,
  onNotify,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  const buttonClass = "h-7 w-7 text-gray-400 hover:bg-gray-50";

  return (
    <div className="flex items-center justify-end gap-1">
      {onView ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onView}>
          <Eye className="h-3.5 w-3.5 text-teal-500" />
        </Button>
      ) : null}
      {onApprove ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onApprove}>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        </Button>
      ) : null}
      {onReject ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onReject}>
          <Star className="h-3.5 w-3.5 text-amber-500" />
        </Button>
      ) : null}
      {onNotify ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onNotify}>
          <Send className="h-3.5 w-3.5 text-sky-500" />
        </Button>
      ) : null}
      {onEdit ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button variant="ghost" size="icon-xs" className={buttonClass} onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
        </Button>
      ) : null}
    </div>
  );
}
