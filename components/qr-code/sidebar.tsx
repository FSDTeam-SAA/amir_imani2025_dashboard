"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Gift,
  LogOut,
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
import { cn } from "@/lib/utils";
import { memo } from "react";

interface SidebarProps {
  onLogout?: () => void;
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
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

const NavLink = memo(({ href, isActive, icon, label }: NavLinkProps) => (
  <Link
    href={href}
    className={cn(
      "px-3 py-2 rounded-sm flex items-center justify-between cursor-pointer transition-colors",
      isActive
        ? "bg-foreground backdrop-blur-sm text-white"
        : "text-foreground hover:bg-white/10"
    )}
  >
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm font-medium font-heading">{label}</p>
    </div>
    {isActive && (
      <Image
        src="/assets/sidebar-sparkle.svg"
        alt=""
        width={16}
        height={16}
        className="h-4 w-4"
        aria-hidden="true"
      />
    )}
  </Link>
));

NavLink.displayName = "NavLink";

export const Sidebar = memo(({ onLogout }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[312px] bg-[#f2e3c6] text-white flex-col h-screen">
      <div className="p-6 flex items-center justify-center border-b border-[#D4A13D]/20">
        <Image
          src="/assets/amir_imani-logo.svg"
          alt="Ultra Prestigious Winner"
          width={278}
          height={115}
          priority
        />
      </div>

      <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={item.match(pathname)}
              icon={<Icon className="h-5 w-5" aria-hidden="true" />}
              label={item.label}
            />
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#D4A13D]/20">
        <div className="mb-4 flex items-center gap-2 text-foreground">
          <div className="h-9 w-9 rounded-full bg-white" />
          <div>
            <p className="text-sm font-semibold leading-none">Demo Name</p>
            <p className="text-xs text-foreground/70">Super Admin</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-[#F04D2A] bg-transparent border-[#F04D2A]/50 hover:bg-[#F04D2A] hover:text-white transition-colors duration-300"
          onClick={onLogout}
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Log out
        </Button>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
