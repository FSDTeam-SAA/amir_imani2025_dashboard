"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import {
  DashboardPanel,
  PaginationFooter,
} from "@/components/dashboard/dashboard-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productNotificationService } from "@/lib/api/product-notification-service";
import { queryKeys } from "@/lib/query-keys";

const ITEMS_PER_PAGE = 10;

export default function ProductNotificationsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.productNotifications.list(),
    queryFn: productNotificationService.getAll,
  });

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return notifications;

    return notifications.filter((notification) =>
      [
        notification.productName,
        notification.userName || "",
        notification.email,
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [notifications, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredNotifications]);

  const from =
    filteredNotifications.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredNotifications.length,
  );

  return (
    <>
      <DashboardHeader
        title="Product notifications"
        description="Track customers who want an email when an unavailable product returns."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search product, customer or email..."
              filters={[]}
              onSearch={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              onFilterChange={() => undefined}
            />
          </div>

          <div className="px-4 pb-4 text-xs text-gray-500">
            {filteredNotifications.length} notification request
            {filteredNotifications.length === 1 ? "" : "s"} found.
          </div>

          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {["Product", "Customer", "Email", "Requested"].map(
                    (head) => (
                      <TableHead
                        key={head}
                        className="h-10 text-xs font-semibold text-[#F04D2A]"
                      >
                        {head}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <EmptyRow message="Loading notification requests..." />
                ) : isError ? (
                  <EmptyRow
                    message="Failed to load notification requests."
                    className="text-rose-500"
                  />
                ) : paginatedNotifications.length === 0 ? (
                  <EmptyRow message="No notification requests found." />
                ) : (
                  paginatedNotifications.map((notification) => (
                    <TableRow
                      key={notification._id}
                      className="border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell>
                        <div className="flex min-w-52 items-center gap-3">
                          {notification.productImage ? (
                            <Image
                              src={notification.productImage}
                              alt={notification.productName}
                              width={40}
                              height={40}
                              className="h-10 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded bg-gray-100" />
                          )}
                          <span className="font-medium text-gray-800">
                            {notification.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {notification.userName || "Guest"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {notification.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-500">
                        {formatDate(notification.createdAt)}
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
            total={filteredNotifications.length}
            pages={Array.from({ length: totalPages }, (_, index) => index + 1)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </DashboardPanel>
      </div>
    </>
  );
}

function EmptyRow({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={4}
        className={`py-10 text-center text-sm text-gray-500 ${className}`}
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
