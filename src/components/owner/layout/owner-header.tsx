"use client";

import { Menu, Search, Bell, Check, Circle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import UserAvatarDropdown from "@/components/shared/auth/user-avatar-dropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, NavItem } from "@/components/owner/layout/owner-sidebar";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { ownerNotificationApi, Notification } from "@/api/owner/owner-notification.api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface OwnerHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}

export default function OwnerHeader({
  title,
  subtitle,
  searchPlaceholder = "Search properties, bookings...",
  onSearch,
  actions,
}: OwnerHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        ownerNotificationApi.getNotifications(),
        ownerNotificationApi.getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await ownerNotificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ownerNotificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 lg:px-8 transition-all duration-300">
      {/* Left: Mobile Menu Trigger + Title */}
      <div className="flex items-center gap-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10 hover:bg-slate-100 rounded-full transition-colors">
              <Menu size={22} className="text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col pt-6 bg-white border-r-0 shadow-2xl">
            <div className="px-6 pb-6">
              <Logo href="/owner" variant="default" width={140} height={48} />
            </div>
            <nav className="flex-1 px-4 overflow-y-auto">
              <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/owner" && pathname.startsWith(item.href + "/"));
                  return (
                    <NavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  );
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base sm:text-[19px] font-bold text-slate-900 m-0 leading-tight tracking-tight truncate max-w-[160px] sm:max-w-xs transition-all duration-300">
            {title}
          </h1>
          <p className="text-[11px] sm:text-[13px] text-slate-500 m-0 mt-0.5 hidden sm:block truncate max-w-xs font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative group w-[160px] sm:w-[220px] lg:w-[320px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--brand-primary)] transition-colors duration-200" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-10 rounded-full h-10 text-[13px] border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 placeholder:text-slate-400 w-full focus-visible:ring-4 focus-visible:ring-[var(--brand-primary)]/10 focus-visible:border-[var(--brand-primary)] focus-visible:bg-white transition-all duration-300 shadow-sm"
          />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {actions}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-200/60 pl-2 sm:pl-3 ml-1 sm:ml-2">
          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={cn(
                "relative h-10 w-10 rounded-full transition-colors",
                isNotificationOpen ? "bg-slate-100" : "hover:bg-slate-100"
              )}
            >
              <Bell size={20} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                </span>
              )}
            </Button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="h-7 text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 px-2 -mr-2"
                    >
                      <Check size={14} className="mr-1" />
                      Mark all as read
                    </Button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-slate-500 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Bell size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No notifications</p>
                      <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {notifications.map((notification) => (
                        <li 
                          key={notification.id}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                          className={cn(
                            "px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 relative group",
                            !notification.isRead ? "bg-[var(--brand-primary)]/[0.02]" : ""
                          )}
                        >
                          {!notification.isRead && (
                            <Circle size={8} className="absolute left-2.5 top-[18px] fill-[var(--brand-primary)] text-[var(--brand-primary)]" />
                          )}
                          <div className={cn("flex-1", !notification.isRead ? "pl-2.5" : "pl-2.5")}>
                            <h4 className={cn(
                              "text-[13px] mb-1 leading-tight", 
                              !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-600 transition-colors">
                              {notification.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <UserAvatarDropdown />
        </div>
      </div>
    </header>
  );
}
