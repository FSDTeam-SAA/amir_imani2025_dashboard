"use client";

import React, { useState, useMemo } from "react";
import { Search, Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { signOut } from "next-auth/react";

const INITIAL_CUSTOMERS = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", phone: "+1 234 567 8901", orders: 12, joined: "25 Jun 2026", status: "Active", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", phone: "+1 345 878 9012", orders: 15, joined: "30 Jul 2026", status: "Active", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
  { id: 3, name: "Michael Johnson", email: "michael.johnson@example.com", phone: "+1 456 789 0123", orders: 32, joined: "12 Aug 2025", status: "Blocked", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" },
  { id: 4, name: "Emily Davis", email: "emily.daviz@example.com", phone: "+1 567 890 1234", orders: 27, joined: "03 Sep 2024", status: "Blocked", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: 5, name: "Carlos Martinez", email: "carlos.martinez@example.com", phone: "+1 678 901 2345", orders: 21, joined: "22 Nov 2027", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
  { id: 6, name: "Sophia Lee", email: "sophia.lee@example.com", phone: "+1 789 012 3456", orders: 45, joined: "19 Jan 2025", status: "Active", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" },
  { id: 7, name: "David Brown", email: "david.brown@example.com", phone: "+1 890 123 4567", orders: 38, joined: "06 Dec 2026", status: "Blocked", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" },
  { id: 8, name: "Olivia Wilson", email: "olivia.wilson@example.com", phone: "+1 901 234 5678", orders: 29, joined: "14 Apr 2024", status: "Active", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
  { id: 9, name: "Ethan Clark", email: "ethan.clark@example.com", phone: "+1 012 345 6789", orders: 34, joined: "28 Feb 2026", status: "Pending", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80" },
  { id: 10, name: "Ava Lewis", email: "ava.lewis@example.com", phone: "+1 123 456 7890", orders: 22, joined: "11 Jul 2027", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: 11, name: "Liam Walker", email: "liam.walker@example.com", phone: "+1 234 567 8902", orders: 41, joined: "05 May 2025", status: "Blocked", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: 12, name: "Mia Hall", email: "mia.hall@example.com", phone: "+1 345 678 9013", orders: 26, joined: "30 Sep 2024", status: "Active", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80" },
  { id: 13, name: "Noah Allen", email: "noah.allen@example.com", phone: "+1 456 789 0125", orders: 37, joined: "20 Oct 2026", status: "Active", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" },
  { id: 14, name: "Charlotte Young", email: "charlotte.young@example.com", phone: "+1 567 890 1236", orders: 33, joined: "04 Jan 2025", status: "Blocked", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: 15, name: "James King", email: "james.king@example.com", phone: "+1 678 901 2347", orders: 39, joined: "17 Mar 2027", status: "Blocked", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
];

export default function CustomerTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("All Joined Date");
  const itemsPerPage = 5;

  // Simple Mock Filtering Logic
  const filteredCustomers = useMemo(() => {
    let filtered = INITIAL_CUSTOMERS.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search);
      
      const matchesStatus =
        statusFilter === "All Status" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Date sorting
    if (dateFilter === "Newest First") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.joined).getTime() - new Date(a.joined).getTime()
      );
    } else if (dateFilter === "Oldest First") {
      filtered = [...filtered].sort((a, b) => 
        new Date(a.joined).getTime() - new Date(b.joined).getTime()
      );
    }

    return filtered;
  }, [search, statusFilter, dateFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCustomers.length);
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

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
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
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
              <option>Active</option>
              <option>Blocked</option>
              <option>Pending</option>
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
      <div className="bg-white px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFF3E9] text-[#D97736] font-semibold text-xs tracking-wide uppercase border-b border-orange-100/50">
                <th className="py-4 px-6 text-center sm:text-left">Customer</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6 text-center">Orders</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => console.log('Customer clicked:', customer)}
                  >
                    {/* Customer Identity */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                      <span className="font-bold text-gray-800 whitespace-nowrap">{customer.name}</span>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{customer.email}</td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{customer.phone}</td>

                    {/* Orders */}
                    <td className="py-4 px-6 text-center font-medium text-gray-800">{customer.orders}</td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{customer.joined}</td>

                    {/* Status Pill matching perfectly */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border min-w-[75px] ${
                          customer.status === "Active"
                            ? "bg-[#E6F9F2] text-[#10B981] border-[#B2F5EA]/30"
                            : customer.status === "Blocked"
                            ? "bg-[#FFEBEB] text-[#EF4444] border-[#FED7D7]/30"
                            : "bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]/30"
                        }`}
                      >
                        {customer.status}
                      </span>
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
        {filteredCustomers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
            {/* Details Label */}
            <div className="text-xs text-gray-400 font-medium">
              Showing {startIndex + 1} to {endIndex} of {filteredCustomers.length} customers
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
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-400">
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
              ))}

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