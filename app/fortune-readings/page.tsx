"use client";

import { signOut } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterControl } from "@/components/dashboard/filter-control";
import {
  DashboardPanel,
  PaginationFooter,
  StatusBadge,
} from "@/components/dashboard/dashboard-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const readings = [
  {
    id: "FR-2041",
    player: "John Doe",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100",
    symbols: [
      { name: "Ahura", bg: "bg-[#FDF2E2]", text: "text-[#D97706]" },
      { name: "Enki", bg: "bg-[#E6F4F1]", text: "text-[#0D9488]" },
      { name: "Titan", bg: "bg-[#F3F4F6]", text: "text-[#4B5563]" },
    ],
    date: "25 Jun 2026",
    status: "Completed",
  },
  {
    id: "FR-2042",
    player: "Alice Smith",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100",
    symbols: [
      { name: "Aurora", bg: "bg-[#FDF2E2]", text: "text-[#D97706]" },
      { name: "Hermes", bg: "bg-[#E6F4F1]", text: "text-[#0D9488]" },
      { name: "Apollo", bg: "bg-[#F3F4F6]", text: "text-[#4B5563]" },
    ],
    date: "12 Jul 2026",
    status: "Completed",
  },
  {
    id: "FR-2043",
    player: "Robert Brown",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100",
    symbols: [
      { name: "Zephyr", bg: "bg-[#FDF2E2]", text: "text-[#D97706]" },
      { name: "Poseidon", bg: "bg-[#E6F4F1]", text: "text-[#0D9488]" },
      { name: "Atlas", bg: "bg-[#F3F4F6]", text: "text-[#4B5563]" },
    ],
    date: "05 Aug 2026",
    status: "Completed",
  },
];

export default function FortuneReadingsPage() {
  return (
    <>
      <DashboardHeader
        title="Fortune Telling Management"
        description="Manage all fortune readings, user activity, and generated results."
        onLogout={() => {
          localStorage.removeItem("authToken");
          signOut({ callbackUrl: "/login" });
        }}
      />
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <DashboardPanel>
          <div className="p-4">
            <FilterControl
              searchPlaceholder="Search player name, game name or review..."
              filters={["All Games", "All Ratings", "All Status", "mm/dd/yyyy"]}
            />
          </div>
          <div className="overflow-x-auto px-4">
            <Table className="border-collapse">
              <TableHeader className="bg-[#FDF2E2]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-12 text-xs font-bold text-[#E0533C] pl-6 w-[25%]">
                    Player
                  </TableHead>
                  <TableHead className="h-12 text-xs font-bold text-[#E0533C] text-center w-[35%]">
                    Selected Symbols
                  </TableHead>
                  <TableHead className="h-12 text-xs font-bold text-[#E0533C] text-center w-[20%]">
                    Reading Date
                  </TableHead>
                  <TableHead className="h-12 text-xs font-bold text-[#E0533C] text-center w-[20%]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    {/* Player Column */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                          <img
                            src={row.avatar}
                            alt={row.player}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-sm text-gray-800">
                          {row.player}
                        </span>
                      </div>
                    </TableCell>

                    {/* Selected Symbols Column */}
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        {row.symbols.map((symbol, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${symbol.bg} ${symbol.text} border border-gray-100`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full current-color opacity-70`}
                              style={{ backgroundColor: "currentColor" }}
                            />
                            {symbol.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {/* Reading Date Column */}
                    <TableCell className="py-4 text-center text-sm font-medium text-gray-500 font-mono">
                      {row.date}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={row.status} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter from={1} to={10} total={2864} />
        </DashboardPanel>
      </div>
    </>
  );
}
