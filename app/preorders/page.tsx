"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import {
  DashboardPanel,
  PaginationFooter,
  StatusBadge,
} from "@/components/dashboard/dashboard-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { preorderService } from "@/lib/api/preorder-service";
import { queryKeys } from "@/lib/query-keys";
import { Preorder, PreorderStatus } from "@/lib/types/preorder";

const ITEMS_PER_PAGE = 10;

export default function PreordersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: preorders = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.preorders.list({ search, status: statusFilter }),
    queryFn: () =>
      preorderService.getAll({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: PreorderStatus;
    }) => preorderService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Preorder status updated successfully.");
      queryClient.invalidateQueries({ queryKey: queryKeys.preorders.all });
    },
    onError: () => {
      toast.error("Failed to update preorder status.");
    },
  });

  const paginatedPreorders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return preorders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, preorders]);

  const totalPages = Math.max(1, Math.ceil(preorders.length / ITEMS_PER_PAGE));
  const from = preorders.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(currentPage * ITEMS_PER_PAGE, preorders.length);

  return (
    <>
      <DashboardHeader
        title="Preorders"
        description="Track preorder submissions from the website and mark them completed when handled."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search customer, email or product..."
              filters={[statusLabel(statusFilter)]}
              onSearch={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              onFilterChange={(_, value) => {
                setStatusFilter(value.toLowerCase());
                setCurrentPage(1);
              }}
              filterOptions={{
                status: ["All", "Pending", "Completed"],
              }}
            />
          </div>

          <div className="px-4 pb-4 text-xs text-gray-500">
            {preorders.length} preorder submissions found.
            Click the status badge to toggle between pending and completed.
          </div>

          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {[
                    "Customer",
                    "Contact",
                    "Product",
                    "Type",
                    "Category",
                    "Submitted",
                    "Status",
                  ].map((head) => (
                    <TableHead
                      key={head}
                      className="h-10 text-xs font-semibold text-[#F04D2A]"
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
                      colSpan={7}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      Loading preorders...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-rose-500"
                    >
                      Failed to load preorders.
                    </TableCell>
                  </TableRow>
                ) : paginatedPreorders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      No preorders found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPreorders.map((preorder) => (
                    <TableRow
                      key={preorder._id}
                      className="border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {preorder.userName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div>{preorder.userEmail}</div>
                        {preorder.userPhone && (
                          <div className="mt-1 text-xs text-gray-400">
                            {preorder.userPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">
                        <div className="flex min-w-44 items-center gap-3">
                          <Image
                            src={getProductImage(preorder)}
                            alt={preorder.productName}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded object-cover"
                          />
                          <span>{preorder.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-gray-600">
                        {preorder.productType || "n/a"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {preorder.category || "n/a"}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(preorder.createdAt)}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="rounded-full"
                          disabled={statusMutation.isPending}
                          onClick={() => toggleStatus(preorder)}
                        >
                          <StatusBadge status={statusLabel(preorder.status)} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationFooter
            from={from}
            to={to}
            total={preorders.length}
            pages={Array.from({ length: totalPages }, (_, index) => index + 1)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </DashboardPanel>
      </div>
    </>
  );

  function toggleStatus(preorder: Preorder) {
    if (statusMutation.isPending) return;

    statusMutation.mutate({
      id: preorder._id,
      status: preorder.status === "pending" ? "completed" : "pending",
    });
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status.toLowerCase() === "all") return "All";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getProductImage(preorder: Preorder) {
  if (preorder.productImage) return preorder.productImage;

  return typeof preorder.productId === "string"
    ? "/no-image.jpg"
    : preorder.productId.imgs?.[0] || "/no-image.jpg";
}
