"use client";

import * as React from "react";
import { ChevronDown, Edit2, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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

interface Coupon {
  code: string;
  description: string;
  discountType: string;
  value: string;
  eligibleUsers: string;
  usageCurrent: number;
  usageTotal: number;
  expiryDate: string;
  status: "Active" | "Scheduled" | "Expired";
}

const coupons: Coupon[] = [
  ["SUMMER25", "Summer Sale 2026", "25%", "All Users", 1842, 5000, "2026-08-31", "Active"],
  ["WINTER15", "Winter Clearance 2026", "15%", "New Customers", 1250, 3000, "2026-12-15", "Scheduled"],
  ["SPRING30", "Spring Fest 2026", "30%", "Returning Users", 732, 2000, "2026-05-20", "Active"],
  ["FALL20", "Autumn Special 2026", "20%", "Selected Items", 900, 1000, "2026-10-10", "Expired"],
  ["FLASH10", "Flash Deal 2026", "10%", "All Users", 350, 1500, "2026-07-01", "Active"],
  ["BACKTOSCHOOL5", "Back to School 2026", "5%", "Students Only", 500, 1000, "2026-08-25", "Scheduled"],
  ["BLACKFRIDAY50", "Black Friday 2026", "50%", "All Users", 2000, 3000, "2026-11-24", "Active"],
  ["CYBERMONDAY40", "Cyber Monday 2026", "40%", "Online Purchases", 1500, 2500, "2026-11-28", "Active"],
  ["EASTER20", "Easter Sale 2026", "20%", "All Users", 800, 1200, "2026-04-10", "Active"],
  ["VALENTINE15", "Valentine's Day 2026", "15%", "Couples Only", 600, 900, "2026-02-14", "Scheduled"],
  ["HALLOWEEN10", "Halloween Discount 2026", "10%", "All Users", 400, 500, "2026-10-31", "Expired"],
].map(([code, description, value, eligibleUsers, usageCurrent, usageTotal, expiryDate, status]) => ({
  code: String(code),
  description: String(description),
  discountType: "% Percentage",
  value: String(value),
  eligibleUsers: String(eligibleUsers),
  usageCurrent: Number(usageCurrent),
  usageTotal: Number(usageTotal),
  expiryDate: String(expiryDate),
  status: status as Coupon["status"],
}));

export default function CouponDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"All" | Coupon["status"]>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredData = React.useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesTab = activeTab === "All" || coupon.status === activeTab;
      const matchesSearch = `${coupon.code} ${coupon.description}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

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

      <div className="mt-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm md:p-6">
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
              {filteredData.slice(0, 10).map((coupon) => {
                const progressPercentage = (coupon.usageCurrent / coupon.usageTotal) * 100;
                return (
                  <TableRow key={coupon.code} className="border-b border-gray-100 hover:bg-gray-50/40">
                    <TableCell className="py-3.5">
                      <div className="font-bold text-gray-900">{coupon.code}</div>
                      <div className="mt-0.5 text-xs text-gray-400">{coupon.description}</div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge variant="secondary" className="rounded-md border-0 bg-gray-100 px-2 py-0.5 font-normal text-gray-600">
                        {coupon.discountType}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 font-bold text-gray-800">{coupon.value}</TableCell>
                    <TableCell className="py-3.5 text-gray-600">{coupon.eligibleUsers}</TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Progress value={progressPercentage} className="h-2 w-24 bg-gray-100" />
                        <span className="text-xs text-gray-400">
                          <strong className="font-medium text-gray-600">{coupon.usageCurrent}</strong>/{coupon.usageTotal}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-500">{coupon.expiryDate}</TableCell>
                    <TableCell className="py-3.5">
                      <Status status={coupon.status} />
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button className="text-gray-400 transition-colors hover:text-gray-600">
                          <Edit2 className="h-4 w-4 stroke-[1.75]" />
                        </button>
                        <button className="text-gray-400 transition-colors hover:text-rose-500">
                          <Trash2 className="h-4 w-4 stroke-[1.75]" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="-mx-4 -mb-4 mt-8 flex flex-col items-center justify-between gap-4 rounded-b-md bg-[#f4f7f9] px-4 py-4 text-sm font-medium text-slate-500 sm:flex-row md:-mx-6 md:-mb-6 md:px-6">
          <div>Showing 1 to {Math.min(10, filteredData.length)} of 500 results</div>
          <Pagination className="w-auto">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage((page) => page - 1);
                  }}
                  className="h-8 w-8 rounded-md border border-slate-300 bg-white p-0 text-slate-600 shadow-sm hover:bg-slate-50"
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={currentPage === 1}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(1);
                  }}
                  className={`h-8 w-8 rounded-md p-0 text-sm font-bold shadow-sm ${
                    currentPage === 1
                      ? "border border-[#0B0F19] bg-[#0B0F19] text-white hover:bg-[#0B0F19]/90"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-400 shadow-sm">
                  <PaginationEllipsis className="h-4 w-4" />
                </div>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={currentPage === 50}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(50);
                  }}
                  className="h-8 w-8 rounded-md border border-slate-300 bg-white p-0 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                >
                  50
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < 50) setCurrentPage((page) => page + 1);
                  }}
                  className="h-8 w-8 rounded-md border border-slate-300 bg-white p-0 text-slate-600 shadow-sm hover:bg-slate-50"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}

function Status({ status }: { status: Coupon["status"] }) {
  const className = {
    Active: "bg-emerald-50 text-emerald-600",
    Scheduled: "bg-amber-50 text-amber-600",
    Expired: "bg-rose-50 text-rose-600",
  }[status];

  return <Badge className={`rounded-md border-0 px-2.5 py-0.5 font-medium ${className}`}>{status}</Badge>;
}
