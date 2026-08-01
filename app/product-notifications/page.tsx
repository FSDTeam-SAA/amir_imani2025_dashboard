"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPanel } from "@/components/dashboard/dashboard-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productNotificationService } from "@/lib/api/product-notification-service";

export default function ProductNotificationsPage() {
  const { data: notifications = [], isLoading, isError } = useQuery({ queryKey: ["product-notifications"], queryFn: productNotificationService.getAll });
  return <>
    <DashboardHeader title="Product notifications" description="Customers waiting to be notified when unavailable products return." onLogout={() => { localStorage.removeItem("authToken"); signOut({ callbackUrl: "/login" }); }} />
    <div className="flex-1 overflow-auto p-4 md:p-6"><DashboardPanel>
      <div className="flex items-center gap-3 border-b border-[#f2e3c6] p-5"><div className="rounded-full bg-[#F04D2A]/10 p-2 text-[#F04D2A]"><BellRing className="h-5 w-5" /></div><div><p className="font-semibold text-gray-900">{notifications.length} notification request{notifications.length === 1 ? "" : "s"}</p><p className="text-sm text-gray-500">Each email belongs to a customer waiting for a specific product.</p></div></div>
      <div className="overflow-x-auto p-4"><Table><TableHeader className="bg-[#F2E3C6]/70"><TableRow>{["Product", "Customer", "Email", "Requested"].map((item) => <TableHead key={item} className="text-xs font-semibold text-[#F04D2A]">{item}</TableHead>)}</TableRow></TableHeader><TableBody>
        {isLoading ? <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-500">Loading notification requests...</TableCell></TableRow> : isError ? <TableRow><TableCell colSpan={4} className="py-10 text-center text-rose-500">Failed to load notification requests.</TableCell></TableRow> : notifications.length === 0 ? <TableRow><TableCell colSpan={4} className="py-10 text-center text-gray-500">No notification requests yet.</TableCell></TableRow> : notifications.map((item) => <TableRow key={item._id}><TableCell><div className="flex min-w-48 items-center gap-3">{item.productImage ? <Image src={item.productImage} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-gray-100" />}<span className="font-medium text-gray-800">{item.productName}</span></div></TableCell><TableCell className="text-gray-600">{item.userName || "Guest"}</TableCell><TableCell className="text-gray-700">{item.email}</TableCell><TableCell className="whitespace-nowrap text-gray-500">{new Date(item.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</TableCell></TableRow>)}
      </TableBody></Table></div>
    </DashboardPanel></div>
  </>;
}
