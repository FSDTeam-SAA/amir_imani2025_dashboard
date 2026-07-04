"use client";

import { signOut } from "next-auth/react";
import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ActionButtons, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search, Calendar, ChevronDown } from "lucide-react";

const allSubscribers = Array.from({ length: 48 }, (_, index) => ({
  name: "John Doe",
  email: "john.doe@example.com",
  game: "Dragon's Lair",
  category: "RPG / Fantasy",
  subscribed: index === 0 ? "18 Jun 2026" : "25 Jun 2026", 
  release: index === 0 ? "28 Jun 2026" : "25 Jun 2026",
  status: index % 3 === 0 ? "Subscribed" : index % 3 === 1 ? "Notified" : "Released",
}));

export default function SubscribersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allSubscribers.length);
  
  const currentSubscribers = useMemo(() => {
    return allSubscribers.slice(startIndex, endIndex);
  }, [startIndex, endIndex]);

  const totalPages = Math.ceil(allSubscribers.length / itemsPerPage);

  // পেজ নেভিগেশন হ্যান্ডলার
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // ফিগমার লেআউট স্টাইল জেনারেটর [1, 2, 3, 4, 5, '-', 6]
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
        title="Game Subscription Management"
        description="Manage users subscribed to upcoming and published games."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-white font-sans">
        
        {/* ================= FIGMA FILTER BAR INTERFACE (image_93367c.png) ================= */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 pb-6">
          {/* Input Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer, Product..." 
              className="w-full h-10 pl-11 pr-4 text-sm bg-white border border-[#EAE6DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D35738] text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Figma Specific Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[120px]">
              <span>Order Status</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[130px]">
              <span>Payment Status</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Date Input block */}
            <div className="relative h-10 flex items-center bg-white border border-[#EAE6DF] rounded-md px-3 min-w-[160px]">
              <input 
                type="text" 
                placeholder="mm/dd/yyyy" 
                className="w-full bg-transparent text-xs text-gray-400 focus:outline-none placeholder:text-gray-400"
              />
              <Calendar className="w-3.5 h-3.5 text-gray-400 ml-2" />
            </div>

            <button className="h-10 px-4 flex items-center justify-between gap-4 bg-white border border-[#EAE6DF] rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors min-w-[100px]">
              <span>Newest</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ================= TABLE INTERFACE (image_93367c.png) ================= */}
        <div className="overflow-x-auto w-full">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-[#FAF1E3] border-none">
              <TableRow className="hover:bg-transparent border-none">
                {['Subscriber', 'Email', 'Game', 'Game Category', 'Subscription Date', 'Release Date', 'Status', 'Action'].map((head) => (
                  <TableHead 
                    key={head} 
                    className="h-12 text-xs font-bold text-[#D35738] border-none px-4 first:pl-6 last:pr-6"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSubscribers.map((subscriber, index) => (
                <TableRow 
                  key={`${subscriber.email}-${index}`} 
                  className="border-b border-[#F5F2EC] hover:bg-gray-50/40 transition-colors"
                >
                  {/* Subscriber Name with Round Profile */}
                  <TableCell className="py-4 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#4B79A1] shadow-sm shrink-0" />
                      <span className="font-semibold text-[#222222] text-sm">{subscriber.name}</span>
                    </div>
                  </TableCell>

                  {/* Email address */}
                  <TableCell className="py-4 px-4 text-sm font-normal text-[#8A8A8A]">
                    {subscriber.email}
                  </TableCell>

                  {/* Game Info with Image Square */}
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded bg-gradient-to-tr from-[#0D1113] to-[#4A6B6C] shrink-0 shadow-inner" />
                      <span className="font-semibold text-[#1A1A1A] text-sm">{subscriber.game}</span>
                    </div>
                  </TableCell>

                  {/* Game Category Pill */}
                  <TableCell className="py-4 px-4">
                    <Badge className="border-0 bg-[#F4EFE6] text-[#6C5B3F] font-medium text-[11px] px-2.5 py-1 rounded shadow-none">
                      {subscriber.category}
                    </Badge>
                  </TableCell>

                  {/* Dates columns */}
                  <TableCell className="py-4 px-4 text-sm font-normal text-[#8A8A8A]">
                    {subscriber.subscribed}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm font-normal text-[#8A8A8A]">
                    {subscriber.release}
                  </TableCell>

                  {/* Status Pills */}
                  <TableCell className="py-4 px-4">
                    <StatusBadge status={subscriber.status} />
                  </TableCell>

                  {/* Action row buttons buttons wrapper */}
                  <TableCell className="py-4 px-4 pr-6">
                    <ActionButtons onNotify={() => undefined} onDelete={() => undefined} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ================= WORKABLE PAGINATION FOOTER ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 bg-white">
          {/* Dynamic counter logs text */}
          <div className="text-xs text-gray-400 font-medium">
            Showing {startIndex + 1} to {endIndex} of {allSubscribers.length} customers
          </div>

          {/* Dynamic Pagination layout */}
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