"use client";

import { Calendar, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterControlProps {
  searchPlaceholder: string;
  filters?: string[];
  className?: string;
  onSearch?: (value: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  filterOptions?: {
    status?: string[];
    date?: string[];
  };
}

export function FilterControl({
  searchPlaceholder,
  filters = [],
  className,
  onSearch,
  onFilterChange,
  filterOptions = {}
}: FilterControlProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterSelect = (filterType: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-3 lg:flex-row", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
        <Input
          placeholder={searchPlaceholder}
          className="h-9 border-gray-200 bg-white pl-9 text-xs placeholder:text-gray-300 focus-visible:ring-[#F04D2A]/20"
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        {filterOptions.status && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-gray-200 bg-white text-xs font-normal text-gray-500 hover:bg-gray-50"
              >
                {filters?.[0] || "All Status"}
                <ChevronDown className="h-3.5 w-3.5 text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              {filterOptions.status.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => handleFilterSelect('status', option)}
                  className={cn(
                    "text-xs cursor-pointer",
                    filters?.[0] === option && "bg-gray-100 font-semibold"
                  )}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Date Filter */}
        {filterOptions.date && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-gray-200 bg-white text-xs font-normal text-gray-500 hover:bg-gray-50"
              >
                {filters?.[1] || "Joined Date"}
                <ChevronDown className="h-3.5 w-3.5 text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              {filterOptions.date.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => handleFilterSelect('date', option)}
                  className={cn(
                    "text-xs cursor-pointer",
                    filters?.[1] === option && "bg-gray-100 font-semibold"
                  )}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Static Date Picker Button - keeping design */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-gray-200 bg-white text-xs font-normal text-gray-500 hover:bg-gray-50"
        >
          mm/dd/yyyy
          <Calendar className="h-3.5 w-3.5 text-gray-300" />
        </Button>
      </div>
    </div>
  );
}