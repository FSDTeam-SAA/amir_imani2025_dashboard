"use client";

import * as React from "react";
import { ChevronDown, Edit2, Loader2, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ApiResponse, Coupon as CouponRecord } from "@/lib/types/coupon";

type CouponStatus = "Active" | "Scheduled" | "Expired";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

const couponQueryKeys = {
  lists: ["coupons", "list"] as const,
};

const getCouponStatus = (coupon: CouponRecord): CouponStatus => {
  if (!coupon.isActive || new Date(coupon.expiryDate) < new Date()) {
    return "Expired";
  }

  return "Active";
};

const formatEligibility = (coupon: CouponRecord) => {
  if (coupon.eligibility === "first_time") return "First-Time Users";
  if (coupon.eligibility === "specific") {
    return `${coupon.eligibleUsers?.length || 0} Specific Users`;
  }

  return "All Users";
};

const formatDiscountType = (coupon: CouponRecord) =>
  coupon.discountType === "percentage" ? "% Percentage" : "$ Fixed Amount";

const formatValue = (coupon: CouponRecord) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : `$${coupon.discountValue}`;

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message || fallback;

const getCoupons = async () => {
  const session = await getSession();
  const res = await fetch(`${API_BASE_URL}/coupons?status=all`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const result = (await res.json()) as ApiResponse<CouponRecord[]>;

  if (!res.ok) {
    throw new Error(result.message || "Failed to load coupons");
  }

  return result.data || [];
};

const deleteCoupon = async (id: string) => {
  const session = await getSession();
  const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const result = (await res.json()) as ApiResponse<unknown>;

  if (!res.ok) {
    throw new Error(result.message || "Failed to delete coupon");
  }

  return result;
};

export default function CouponDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"All" | CouponStatus>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: couponQueryKeys.lists,
    queryFn: getCoupons,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: (data) => {
      toast.success(data.message || "Coupon deleted successfully.");
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.lists });
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error, "Failed to delete coupon."));
    },
  });

  const filteredData = React.useMemo(() => {
    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);
      const matchesTab = activeTab === "All" || status === activeTab;
      const matchesSearch = `${coupon.code} ${coupon.discountType}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, coupons, searchQuery]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pageData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleDelete = (coupon: CouponRecord) => {
    deleteMutation.mutate(coupon._id);
  };

  const deletingCouponId = deleteMutation.isPending
    ? deleteMutation.variables
    : "";

  return (
    <>
      <DashboardHeader
        title="Create Coupon"
        description="Set up a new discount code for your customers"
        actionLabel="Add  Coupon"
        onAction={() => router.push("/coupon-management/new")}
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      <div className="mt-4 rounded-md  bg-white p-4 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-1 rounded-lg border border-gray-100 bg-gray-50 p-1">
            {(["All", "Active", "Scheduled", "Expired"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-[#F04D2A] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 rounded-lg border-gray-200 bg-white pl-9 pr-4 text-xs focus-visible:ring-orange-500/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 rounded-lg border-gray-200 text-gray-600"
            >
              Sort <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                {[
                  "Coupon Code",
                  "Discount Type",
                  "Value",
                  "Eligible Users",
                  "Usage",
                  "Expiry Date",
                  "Status",
                  "Action",
                ].map((head) => (
                  <TableHead
                    key={head}
                    className={`h-11 font-semibold text-gray-700 ${head === "Action" ? "text-right" : ""}`}
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading coupons...
                    </div>
                  </TableCell>
                </TableRow>
              ) : pageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-gray-500"
                  >
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((coupon) => {
                  const progressPercentage =
                    coupon.usageLimit > 0
                      ? (coupon.usedCount / coupon.usageLimit) * 100
                      : 0;
                  const status = getCouponStatus(coupon);
                  return (
                    <TableRow
                      key={coupon._id}
                      className="border-b border-gray-100 hover:bg-gray-50/40"
                    >
                      <TableCell className="py-3.5">
                        <div className="font-bold text-gray-900">
                          {coupon.code}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          Minimum order ${coupon.minOrderAmount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className="rounded-md border-0 bg-gray-100 px-2 py-0.5 font-normal text-gray-600"
                        >
                          {formatDiscountType(coupon)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 font-bold text-gray-800">
                        {formatValue(coupon)}
                      </TableCell>
                      <TableCell className="py-3.5 text-gray-600">
                        {formatEligibility(coupon)}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={progressPercentage}
                            className="h-2 w-24 bg-gray-100"
                          />
                          <span className="text-xs text-gray-400">
                            <strong className="font-medium text-gray-600">
                              {coupon.usedCount}
                            </strong>
                            /{coupon.usageLimit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-gray-500">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Status status={status} />
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() =>
                              router.push(`/coupon-management/${coupon._id}`)
                            }
                            className="text-gray-400 transition-colors hover:text-gray-600"
                          >
                            <Edit2 className="h-4 w-4 stroke-[1.75]" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            disabled={deletingCouponId === coupon._id}
                            className="text-gray-400 transition-colors hover:text-rose-500 disabled:opacity-50"
                          >
                            {deletingCouponId === coupon._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 stroke-[1.75]" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-4 md:flex-row md:items-center md:justify-between">
          {/* Left Side */}
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold">
              {pageData.length ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredData.length}</span>{" "}
            results
          </p>

          {/* Right Side */}
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((page) => page - 1);
                  }}
                  className="h-9 w-9 rounded-lg border border-gray-300 bg-white p-0 shadow-sm transition hover:bg-gray-100"
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={currentPage === 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                  className={`h-9 w-9 rounded-lg p-0 font-medium transition ${
                    currentPage === 1
                      ? "bg-[#0B0F19] text-white hover:bg-[#0B0F19]"
                      : "border border-gray-300 bg-white hover:bg-gray-100"
                  }`}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {totalPages > 2 && (
                <PaginationItem>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white">
                    <PaginationEllipsis className="h-4 w-4" />
                  </div>
                </PaginationItem>
              )}

              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === totalPages}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                    className={`h-9 w-9 rounded-lg p-0 font-medium transition ${
                      currentPage === totalPages
                        ? "bg-[#0B0F19] text-white hover:bg-[#0B0F19]"
                        : "border border-gray-300 bg-white hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage((page) => page + 1);
                  }}
                  className="h-9 w-9 rounded-lg border border-gray-300 bg-white p-0 shadow-sm transition hover:bg-gray-100"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}

function Status({ status }: { status: CouponStatus }) {
  const className = {
    Active: "bg-emerald-50 text-emerald-600",
    Scheduled: "bg-amber-50 text-amber-600",
    Expired: "bg-rose-50 text-rose-600",
  }[status];

  return (
    <Badge
      className={`rounded-md border-0 px-2.5 py-0.5 font-medium ${className}`}
    >
      {status}
    </Badge>
  );
}
