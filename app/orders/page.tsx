"use client";

import { signOut } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import { DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = Array.from({ length: 15 }, (_, index) => ({
  id: `#DRD-${12834 + index}`,
  customer: "John Doe",
  product: "Tarot Card Deck",
  date: "25 Jan 2026",
  total: "$149.99",
  payment: "Paid",
  status: "Completed",
}));

export default function OrdersPage() {
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
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search Order ID, Customer, Product..."
              filters={["Order Status", "Payment Status", "Newest"]}
            />
          </div>
          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {['Order ID', 'Customer', 'Products', 'Order Date', 'Total', 'Payment', 'Order Status'].map((head) => (
                    <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="py-3 font-bold text-gray-900">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                        <span className="font-semibold text-gray-900">{order.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">{order.product}</TableCell>
                    <TableCell className="text-gray-500">{order.date}</TableCell>
                    <TableCell className="font-bold text-gray-900">{order.total}</TableCell>
                    <TableCell><StatusBadge status={order.payment} /></TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter from={1} to={15} total={40} />
        </DashboardPanel>
      </div>
    </>
  );
}
