"use client";

import { signOut } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import { ActionButtons, DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const readings = [
  ["FR-2041", "John Doe", "Tarot Spread", "Love & Relationships", "25 Jun 2026", "Email", "Paid", "Pending"],
  ["FR-2042", "Jane Smith", "Birth Chart", "Career Path", "25 Jun 2026", "Dashboard", "Paid", "Completed"],
  ["FR-2043", "Michael Johnson", "Oracle Reading", "Personal Growth", "24 Jun 2026", "Email", "Paid", "In Review"],
  ["FR-2044", "Emily Davis", "Tarot Spread", "General Guidance", "24 Jun 2026", "Dashboard", "Paid", "Completed"],
  ["FR-2045", "Carlos Martinez", "Numerology", "Life Path", "23 Jun 2026", "Email", "Paid", "Pending"],
  ["FR-2046", "Sophia Lee", "Tarot Spread", "Decision Support", "23 Jun 2026", "Dashboard", "Paid", "Completed"],
  ["FR-2047", "David Brown", "Oracle Reading", "Spiritual Insight", "22 Jun 2026", "Email", "Paid", "In Review"],
  ["FR-2048", "Olivia Wilson", "Birth Chart", "Relationships", "22 Jun 2026", "Dashboard", "Paid", "Completed"],
  ["FR-2049", "Ethan Clark", "Tarot Spread", "Career Path", "21 Jun 2026", "Email", "Pending", "Pending"],
  ["FR-2050", "Ava Lewis", "Numerology", "Personal Growth", "21 Jun 2026", "Dashboard", "Paid", "Completed"],
];

export default function FortuneReadingsPage() {
  return (
    <>
      <DashboardHeader
        title="Fortune Readings"
        description="Manage customer reading requests, delivery status, and responses."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl searchPlaceholder="Search reading ID, customer, topic..." filters={["Reading Type", "Status", "Newest"]} />
          </div>
          <div className="overflow-x-auto px-4">
            <Table>
              <TableHeader className="bg-[#F2E3C6]/70">
                <TableRow className="hover:bg-transparent">
                  {['Reading ID', 'Customer', 'Type', 'Topic', 'Request Date', 'Delivery', 'Payment', 'Status', 'Action'].map((head) => (
                    <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map(([id, customer, type, topic, date, delivery, payment, status]) => (
                  <TableRow key={id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="py-3 font-bold text-gray-900">{id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                        <span className="font-semibold text-gray-900">{customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">{type}</TableCell>
                    <TableCell className="text-gray-500">{topic}</TableCell>
                    <TableCell className="text-gray-500">{date}</TableCell>
                    <TableCell className="text-gray-500">{delivery}</TableCell>
                    <TableCell><StatusBadge status={String(payment)} /></TableCell>
                    <TableCell><StatusBadge status={String(status)} /></TableCell>
                    <TableCell><ActionButtons onView={() => undefined} onEdit={() => undefined} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter from={1} to={10} total={28} />
        </DashboardPanel>
      </div>
    </>
  );
}
