"use client";

import React, { useState } from "react";
import { Search, Calendar, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CustomerTable() {
  const queryClient = useQueryClient();
  
  // 1. Correctly fetch the session using the Client Hook
  const { data: session } = useSession();
  // Adjust this mapping based on where your JWT token is saved in your NextAuth session callback
  const sessionToken = (session as any)?.accessToken || (session as any)?.user?.token;
  
  // States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Joined Date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  // 1. GET Method - Dynamic System
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", currentPage, search, statusFilter, dateFilter, sessionToken],
    queryFn: async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/customers`);
      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("limit", itemsPerPage.toString());

      if (search) url.searchParams.append("search", search);
      if (statusFilter !== "All Status") url.searchParams.append("status", statusFilter.toLowerCase());
      if (dateFilter === "Newest First") url.searchParams.append("sort", "desc");
      if (dateFilter === "Oldest First") url.searchParams.append("sort", "asc");

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
    enabled: !!sessionToken, // Wait until token is available
  });

  // 2. PATCH Method (Status Update) - Dynamic System
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/${id}/status?status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
          },
        }
      );

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Failed to update status");
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });

  // Extract variables safely from API response
  const customersList = data?.data?.customers || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalCustomers = data?.data?.total || 0;
  
  // Display Math
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCustomers);

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Helper to format date
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mx-auto space-y-4 font-sans">
      <DashboardHeader
        title="Customers"
        description="Manage your customer list and information"
        onAction={() => {}}
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />

      {/* Top Action Controls Header */}
      <div className="flex px-6 flex-col sm:flex-row gap-3 justify-between items-center w-full">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 min-w-[120px]"
            >
              <option>All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Picker Dropdown */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-50 min-w-[140px]"
            >
              <option>All Joined Date</option>
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white px-6 ">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse rounded-lg border border-gray-100 shadow-sm">
            <thead>
              <tr className="bg-[#FDEBD8] text-[#D97736] font-semibold text-xs tracking-wide uppercase border-b border-orange-100/50">
                <th className="py-4 px-6 text-center sm:text-left">Customer</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6 text-center">Orders</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-400">
                    Failed to load customers. Please try again.
                  </td>
                </tr>
              ) : customersList.length > 0 ? (
                customersList.map((customer: any) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Customer Identity */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${customer.name}&background=FDEBD8&color=D97736`}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                      <span className="font-bold text-gray-800 whitespace-nowrap">
                        {customer.name}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {customer.email}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {customer.phone || "N/A"}
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-6 text-center font-medium text-gray-800">
                      {customer.ordersCount}
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {formatDate(customer.joined)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-6 text-center">
                      <div className="relative inline-block w-28">
                        <select
                          disabled={statusMutation.isPending}
                          value={customer.status.toLowerCase()}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: customer._id,
                              status: e.target.value,
                            })
                          }
                          className={`appearance-none w-full text-center cursor-pointer outline-none px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all disabled:opacity-50 ${
                            customer.status.toLowerCase() === "active"
                              ? "bg-[#E6F9F2] text-[#10B981] border-[#B2F5EA]/30 hover:bg-[#D1F4E6]"
                              : "bg-[#FFEBEB] text-[#EF4444] border-[#FED7D7]/30 hover:bg-[#FDD4D4]"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <ChevronDown 
                          className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
                            customer.status.toLowerCase() === "active" ? "text-[#10B981]" : "text-[#EF4444]"
                          }`} 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        {!isLoading && totalCustomers > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
            {/* Details Label */}
            <div className="text-xs text-gray-400 font-medium">
              Showing {startIndex + 1} to {endIndex} of {totalCustomers} customers
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-xs text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-md transition-all ${
                      currentPage === page
                        ? "bg-[#E65F2B] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}