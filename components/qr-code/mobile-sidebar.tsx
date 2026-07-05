"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Gift,
  LogOut,
  Menu,
  QrCode,
  ReceiptText,
  ScrollText,
  Star,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "vaul";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  onLogout?: () => void;
}

const navItems = [
  { href: "/", label: "QR Codes", icon: QrCode, match: (path: string) => path === "/" },
  { href: "/products", label: "Products", icon: Store, match: (path: string) => path.startsWith("/products") },
  { href: "/coupon-management", label: "Coupon Management", icon: Gift, match: (path: string) => path.startsWith("/coupon-management") },
  { href: "/customers", label: "Customer", icon: UserRound, match: (path: string) => path.startsWith("/customers") },
  { href: "/orders", label: "Order", icon: ReceiptText, match: (path: string) => path.startsWith("/orders") },
  { href: "/fortune-readings", label: "Fortune Telling", icon: ScrollText, match: (path: string) => path.startsWith("/fortune-readings") },
  { href: "/subscribers", label: "Subscribers", icon: UsersRound, match: (path: string) => path.startsWith("/subscribers") },
  { href: "/reviews", label: "Reviews...", icon: Star, match: (path: string) => path.startsWith("/reviews") },
  { href: "/blogs", label: "Blogs", icon: BookOpen, match: (path: string) => path.startsWith("/blogs") },
];

export function MobileSidebar({ onLogout }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="left">
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r border-[#D4A13D]/20 bg-[#f2e3c6] text-white focus:outline-none">
          <div className="flex w-full items-center justify-center gap-3 border-b border-[#D4A13D]/20 p-6">
            <Image
              src="/assets/amir_imani-logo.svg"
              alt="Ultra Prestigious Winner Logo"
              width={158}
              height={100}
              className="h-[100px] w-[158px]"
            />
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-sm flex items-center justify-between cursor-pointer transition-colors",
                    active
                      ? "bg-foreground backdrop-blur-sm text-white"
                      : "text-foreground hover:bg-white/10"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <p className="text-sm font-medium font-heading">{item.label}</p>
                  </div>
                  {active && (
                    <Image
                      src="/assets/sidebar-sparkle.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#D4A13D]/20 p-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#F04D2A]/50 bg-transparent text-[#F04D2A] hover:bg-[#F04D2A] hover:text-white"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
