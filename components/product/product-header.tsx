"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/qr-code/mobile-sidebar";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";

const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;

interface ProductHeaderProps {
  onAddProduct: () => void;
  onLogout: () => void;
}

export function ProductHeader({ onAddProduct, onLogout }: ProductHeaderProps) {
  return (
    <header className="bg-[#eeeeee] p-4 md:p-6 border-b">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="md:hidden">
            <MobileSidebar onLogout={onLogout} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold bg-[#F04D2A] bg-clip-text text-transparent font-heading truncate">
              Products
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
              Manage your product inventory
            </p>
          </div>
        </div>

        {/* Desktop Tab Filter */}
        <TabsList className="hidden sm:flex p-1 bg-muted rounded-lg border">
          <TabTriggerItem value="card">Cards</TabTriggerItem>
          <TabTriggerItem value="merchandise">Merchandise</TabTriggerItem>
        </TabsList>

        <Button
          onClick={onAddProduct}
          className="bg-foreground text-[#eeeeee] hover:bg-foreground/80 hover:text-white border-none cursor-pointer duration-300 font-heading whitespace-nowrap text-sm md:text-base px-3 md:px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Mobile Tab Filter */}
      <TabsList className="flex sm:hidden w-full p-1 bg-muted rounded-lg mt-4 border">
        <TabTriggerItem value="card" className="flex-1">
          Cards
        </TabTriggerItem>
        <TabTriggerItem value="merchandise" className="flex-1">
          Merchandise
        </TabTriggerItem>
      </TabsList>
    </header>
  );
}

function TabTriggerItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </TabsTrigger>
  );
}
