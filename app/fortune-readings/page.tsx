"use client";

import { signOut, useSession } from "next-auth/react";
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
import { useQuery } from "@tanstack/react-query";

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface FortuneReading {
  _id: string;
  userId: User;
  symbols: string[];
  fortune: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: FortuneReading[];
}

export default function FortuneReadingsPage() {
  const { data: session } = useSession();
  // Adjust this mapping based on where your JWT token is saved in your NextAuth session callback
  const sessionToken =
    (session as any)?.accessToken || (session as any)?.user?.token;

  const { data, isLoading, error } = useQuery({
    queryKey: ["fortune-readings"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fortune-telling/admin/history`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        },
      );
      const result = await res.json();
      return result as ApiResponse;
    
    },
    enabled: !!sessionToken, // Only run the query if sessionToken is available
  });

  const readings = data?.data || [];

  // Format date from ISO string to "DD MMM YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Get avatar from unsplash with consistent styling
  const getAvatar = (name: string) => {
    // Generate a consistent avatar based on name
    const seed = name.replace(/\s/g, "");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=random&size=100`;
  };

  // Map symbol names to colors
  const getSymbolStyles = (symbol: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      AHURA: { bg: "bg-[#FDF2E2]", text: "text-[#D97706]" },
      ENKI: { bg: "bg-[#E6F4F1]", text: "text-[#0D9488]" },
      TITAN: { bg: "bg-[#F3F4F6]", text: "text-[#4B5563]" },
      GAIA: { bg: "bg-[#EDE7F6]", text: "text-[#7C3AED]" },
      HERA: { bg: "bg-[#FCE4EC]", text: "text-[#E91E63]" },
      MITRA: { bg: "bg-[#E8F5E9]", text: "text-[#43A047]" },
      ARES: { bg: "bg-[#FFEBEE]", text: "text-[#E53935]" },
      ASGARD: { bg: "bg-[#E3F2FD]", text: "text-[#1E88E5]" },
      AURORA: { bg: "bg-[#FFF3E0]", text: "text-[#FB8C00]" },
      HERMES: { bg: "bg-[#E0F7FA]", text: "text-[#00897B]" },
      APOLLO: { bg: "bg-[#F3E5F5]", text: "text-[#8E24AA]" },
      ZEPHYR: { bg: "bg-[#E8EAF6]", text: "text-[#3F51B5]" },
      POSEIDON: { bg: "bg-[#E1F5FE]", text: "text-[#0288D1]" },
      ATLAS: { bg: "bg-[#FBE9E7]", text: "text-[#D84315]" },
    };
    return colorMap[symbol] || { bg: "bg-gray-100", text: "text-gray-600" };
  };

  // Get status based on some logic (since API doesn't provide status)
  const getStatus = (reading: FortuneReading) => {
    // You can implement your own logic here
    // For example, check if it's recent or something
    const date = new Date(reading.createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays < 7 ? "Completed" : "Completed";
  };

  if (isLoading) {
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
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E0533C] mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading fortune readings...
                </p>
              </div>
            </div>
          </DashboardPanel>
        </div>
      </>
    );
  }

  if (error) {
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
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Failed to load readings</p>
                <p className="text-sm">Please try again later</p>
              </div>
            </div>
          </DashboardPanel>
        </div>
      </>
    );
  }

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
                {readings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <p className="text-gray-500">No fortune readings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  readings.map((row) => {
                    const playerName = `${row.userId.firstName} ${row.userId.lastName}`;
                    const formattedDate = formatDate(row.createdAt);
                    const status = getStatus(row);

                    return (
                      <TableRow
                        key={row._id}
                        className="border-b border-gray-100 hover:bg-gray-50/50"
                      >
                        {/* Player Column */}
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                              <img
                                src={getAvatar(playerName)}
                                alt={playerName}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="font-semibold text-sm text-gray-800">
                              {playerName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Selected Symbols Column */}
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {row.symbols.map((symbol, idx) => {
                              const styles = getSymbolStyles(symbol);
                              return (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${styles.bg} ${styles.text} border border-gray-100`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full opacity-70`}
                                    style={{ backgroundColor: "currentColor" }}
                                  />
                                  {symbol.charAt(0) +
                                    symbol.slice(1).toLowerCase()}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>

                        {/* Reading Date Column */}
                        <TableCell className="py-4 text-center text-sm font-medium text-gray-500 font-mono">
                          {formattedDate}
                        </TableCell>

                        {/* Status Column */}
                        <TableCell className="py-4">
                          <div className="flex justify-center">
                            <StatusBadge status={status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationFooter
            from={1}
            to={readings.length}
            total={readings.length}
          />
        </DashboardPanel>
      </div>
    </>
  );
}
