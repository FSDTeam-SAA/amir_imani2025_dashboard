"use client";

import { signOut } from "next-auth/react";
import { useState, useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/dashboard-table";
import { ChevronLeft, ChevronRight, Search, Calendar, ChevronDown } from "lucide-react";

// মোট ৪8 টি ডামি ডাটা তৈরি করা হলো যাতে প্যাজিনেশন টেস্ট করা যায়
const allOrders = Array.from({ length: 48 }, (_, index) => ({
  id: `#ORD-${10284 + index}`, 
  customer: `John Doe ${index + 1}`,
  product: "Tarot Card Deck",
  date: "25 Jun 2026",
  total: "$149.99",
  payment: "Paid",
  status: "Completed",
}));

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allOrders.length);
  const currentOrders = useMemo(() => {
    return allOrders.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  const totalPages = Math.ceil(allOrders.length / itemsPerPage);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    if (totalPages > 6) {
      pages.push("...");
      pages.push(totalPages);
    } else if (totalPages === 6) {
      pages.push(6);
    }
    return pages;
  };

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
        
        {/* ================= FIGMA FILTER CONTROL SECTION ================= */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 pb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer, Product..." 
              className="w-full h-10 pl-11 pr-4 text-sm bg-white border border-[#EAE6DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D35738] text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[120px]">
              <span>Order Status</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[130px]">
              <span>Payment Status</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <div className="relative h-10 flex items-center bg-white border border-[#EAE6DF] rounded-md px-3 min-w-[160px]">
              <input 
                type="text" 
                placeholder="mm/dd/yyyy" 
                className="w-full bg-transparent text-xs text-gray-400 focus:outline-none placeholder:text-gray-400"
              />
              <div className="flex items-center gap-1 text-gray-400 ml-2">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>

            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[100px]">
              <span>Newest</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ================= CUSTOMERS TABLE ================= */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse rounded-lg border border-gray-100 shadow-sm">
            <thead className="bg-[#FDEBD8] ">
              <tr className="border-none">
                {['Order ID', 'Customer', 'Products', 'Order Date', 'Total', 'Payment', 'Order Status'].map((head) => (
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
              {currentOrders.map((order, index) => (
                <tr 
                  key={`${order.id}-${index}`} 
                  className="border-b border-[#F5F2EC] hover:bg-gray-50/30 transition-colors"
                >
                  <td className="py-4 px-4 pl-6 font-extrabold text-[#1A1A1A] text-sm tracking-tight">
                    {order.id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#4B79A1] shadow-sm shrink-0" />
                      <span className="font-semibold text-[#222222] text-sm">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-[#4A4A4A]">{order.product}</td>
                  <td className="py-4 px-4 text-sm font-normal text-[#8A8A8A]">{order.date}</td>
                  <td className="py-4 px-4 text-sm font-bold text-[#1A1A1A]">{order.total}</td>
                  <td className="py-4 px-4"><StatusBadge status={order.payment} /></td>
                  <td className="py-4 px-4 pr-6"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= FIGMA PAGINATION FOOTER ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 bg-white">
          {/* Left Side Info Text dynamic matching image_92d087.png */}
          <div className="text-xs text-gray-400 font-medium">
            Showing {startIndex + 1} to {endIndex} of {allOrders.length} customers
          </div>

          {/* Right Side Pagination Actions */}
          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Buttons List */}
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-400 font-medium select-none">
                  -
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-md transition-all ${
                    currentPage === page
                      ? "bg-[#E65F2B] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            {/* Next Page Button */}
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