"use client";

import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import { ActionButtons, DashboardPanel, PaginationFooter, StatusBadge } from "@/components/dashboard/dashboard-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const subscribers = Array.from({ length: 12 }, (_, index) => ({
  name: "John Doe",
  email: "john.doe@example.com",
  game: "Dragon's Lair",
  category: "RPG / Fantasy",
  subscribed: "25 Jun 2026",
  release: "25 Jun 2026",
  status: index % 4 === 2 ? "Notified" : index % 5 === 3 ? "Released" : "Subscribed",
}));

export default function SubscribersPage() {
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
                  {['Subscriber', 'Email', 'Game', 'Game Category', 'Subscription Date', 'Release Date', 'Status', 'Action'].map((head) => (
                    <TableHead key={head} className="h-10 text-xs font-semibold text-[#F04D2A]">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber, index) => (
                  <TableRow key={`${subscriber.email}-${index}`} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4296A2] to-[#0E1D2B]" />
                        <span className="font-semibold text-gray-900">{subscriber.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{subscriber.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-[linear-gradient(135deg,#0E1D2B,#4296A2,#F04D2A)]" />
                        <span className="font-semibold text-gray-900">{subscriber.game}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="border-0 bg-[#F2E3C6] text-[#8A6A2B]">{subscriber.category}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{subscriber.subscribed}</TableCell>
                    <TableCell className="text-gray-500">{subscriber.release}</TableCell>
                    <TableCell><StatusBadge status={subscriber.status} /></TableCell>
                    <TableCell><ActionButtons onNotify={() => undefined} onDelete={() => undefined} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter from={1} to={8} total={40} />
        </DashboardPanel>
      </div>
    </>
  );
}
