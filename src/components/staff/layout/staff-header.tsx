"use client";

import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import UserAvatarDropdown from "@/components/shared/auth/user-avatar-dropdown";
import NetworkIndicator from "./network-indicator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, NavItem } from "@/components/staff/layout/staff-sidebar";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/branding/logo";

interface StaffHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}

export default function StaffHeader({
  title,
  subtitle,
  searchPlaceholder = "Search order #, room, or item...",
  onSearch,
  actions,
}: StaffHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-[64px] z-40 bg-white/80 backdrop-blur-xl border-b border-[#E8EAED] flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile Menu Trigger + Title */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-9 w-9">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 flex flex-col pt-6">
            <div className="px-5 pb-6">
              <Logo href="/staff" variant="default" width={140} height={48} />
            </div>
            <nav className="flex-1 px-3 overflow-y-auto">
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/staff" && pathname.startsWith(item.href + "/"));
                  const badge = null;
                  return (
                    <NavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      badge={badge}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  );
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[16px] sm:text-lg font-bold text-[#1A1A1A] m-0 leading-6 truncate max-w-[160px] sm:max-w-xs">
            {title}
          </h1>
          <p className="text-[10px] sm:text-xs text-[#6B7280] m-0 mt-0.5 hidden sm:block truncate max-w-xs">{subtitle}</p>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <NetworkIndicator />
        </div>
        <div className="relative w-[140px] sm:w-[200px] lg:w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-9 rounded-full h-9 text-xs border-[#E8EAED] bg-[#F5F6F8] placeholder:text-[#9CA3AF] w-full"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {actions}
        </div>
        <UserAvatarDropdown />
      </div>
    </header>
  );
}
