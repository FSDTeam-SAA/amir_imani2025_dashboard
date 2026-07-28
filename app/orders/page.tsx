"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/dashboard-table";
import { ChevronLeft, ChevronRight, Search, Calendar, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format currency helper
const formatCurrency = (amount: number, currency = "usd") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payment");
  const [dateFilter, setDateFilter] = useState("Newest");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  // Adjust this mapping based on where your JWT token is saved in your NextAuth session callback
  const sessionToken = (session as any)?.accessToken || (session as any)?.user?.token;

  const itemsPerPage = 10;

  // Get API data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders", currentPage, search, statusFilter, paymentFilter, dateFilter, dateRange],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/orders`);
      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("limit", itemsPerPage.toString());

      if (search) url.searchParams.append("search", search);
      if (statusFilter !== "All Status") url.searchParams.append("orderStatus", statusFilter.toLowerCase());
      if (paymentFilter !== "All Payment") url.searchParams.append("paymentStatus", paymentFilter.toLowerCase());

      // Handle date sorting
      if (dateFilter === "Newest") url.searchParams.append("sort", "desc");
      if (dateFilter === "Oldest") url.searchParams.append("sort", "asc");

      if (dateRange.start) url.searchParams.append("startDate", dateRange.start);
      if (dateRange.end) url.searchParams.append("endDate", dateRange.end);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
        },
        body: JSON.stringify({ status }),
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Failed to update order status");
      return response;
    },
    onSuccess: () => {
      toast.success("Order status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message || "Failed to update order status.");
    },
  });

  // Extract orders data from API response
  const orders = useMemo(() => {
    return data?.data?.orders || [];
  }, [data]);

  const totalOrders = useMemo(() => {
    return data?.data?.total || 0;
  }, [data]);

  const totalPages = useMemo(() => {
    return data?.data?.totalPages || 1;
  }, [data]);

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Show loading state
  if (isLoading) {
    return (
      <>
        <DashboardHeader
          title="Order Management"
          description="Manage, track and update all customer orders."
          onLogout={() => {
            localStorage.removeItem("authToken");
            signOut({ callbackUrl: "/login" });
          }}
        />
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white font-sans">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (isError) {
    return (
      <>
        <DashboardHeader
          title="Order Management"
          description="Manage, track and update all customer orders."
          onLogout={() => {
            localStorage.removeItem("authToken");
            signOut({ callbackUrl: "/login" });
          }}
        />
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white font-sans">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Failed to load orders: {error?.message || "Unknown error"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalOrders);

  return (
    <>
      <DashboardHeader
        title="Order Management"
        description="Manage, track and update all customer orders."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      <div className="flex-1 overflow-auto p-4 md:p-8 bg-white font-sans">

        {/* Filter Controls */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 pb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Product..."
              value={search}
              onChange={handleSearchChange}
              className="w-full h-10 pl-11 pr-4 text-sm bg-white border border-[#EAE6DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D35738] text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Order Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-4 pr-8 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-4 pr-8 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
            >
              <option value="All Payment">All Payment</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-4 pr-8 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse rounded-lg border border-gray-100 shadow-sm">
            <thead className="bg-[#FDEBD8]">
              <tr className="border-none">
                {['Order ID', 'Customer', 'Products', 'Shipping address', 'Order Date', 'Total', 'Payment', 'Order Status'].map((head) => (
                  <th
                    key={head}
                    className="h-12 text-left text-xs font-bold text-[#D35738] border-none px-4 first:pl-6 last:pr-6"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders?.map((order: any) => (
                  <tr
                    key={order?._id}
                    className="border-b border-[#F5F2EC] hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="py-4 px-4 pl-6 font-extrabold text-[#1A1A1A] text-sm tracking-tight">
                      {order?._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={order?.customer?.avatar || ""}
                            alt={order?.customerName || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-[#2C3E50] to-[#4B79A1] text-white text-xs font-medium">
                            {order?.customerName
                              ? order?.customerName.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-[#222222] text-sm">
                            {order?.customer?.name || order.customerName || "Unknown Customer"}
                          </p>
                          {(order?.customer?.email || order.customer?.phone) && (
                            <p className="text-xs text-gray-500">
                              {order?.customer.email || order.customer.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex min-w-56 flex-col gap-2">
                        {(order.productDetails?.length ? order.productDetails : order.products?.map((productName: string) => ({ productName })))?.map((product: any) => (
                          <div key={product._id || product.productName} className="flex items-center gap-2 text-sm font-medium text-[#4A4A4A]">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gray-100">
                              {product.imgs?.[0] ? (
                                <img src={product.imgs[0]} alt={product.productName} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <span>{product.productName}</span>
                          </div>
                        )) || "N/A"}
                      </div>
                    </td>
                    <td className="min-w-48 py-4 px-4 text-xs leading-5 text-[#666666]">
                      {order.shippingAddress ? (
                        <>
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br />
                          {order.shippingAddress.country}
                        </>
                      ) : "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm font-normal text-[#8A8A8A]">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-[#1A1A1A]">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.paymentStatus || "pending"} />
                    </td>
                    <td className="py-4 px-4 pr-6">
                      <div className="flex min-w-32 flex-col items-start gap-2">
                        <StatusBadge status={order.orderStatus || "pending"} />
                        <select
                          aria-label={`Update status for order ${order._id}`}
                          value={order.orderStatus || "pending"}
                          disabled={statusMutation.isPending}
                          onChange={(event) => statusMutation.mutate({ id: order._id, status: event.target.value })}
                          className="h-8 w-full rounded-md border border-[#EAE6DF] bg-white px-2 text-xs text-gray-600 outline-none focus:border-[#D35738] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 bg-white">
          <div className="text-xs text-gray-400 font-medium">
            Showing {startIndex} to {endIndex} of {totalOrders} orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-400 font-medium select-none">
                  -
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-md transition-all ${currentPage === page
                      ? "bg-[#E65F2B] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
