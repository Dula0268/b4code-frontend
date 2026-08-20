"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, CalendarCheck, User, LogOut, Settings, Bell, Check } from "lucide-react"
import { toast } from "sonner"
import Logo from "@/components/shared/branding/logo"
import SearchBar from "@/components/guest/search/search-bar"
import { useAuthStore } from "@/store/auth/auth.store"
import { notificationApi, Notification } from "@/api/guest/notification.api"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/guest/search" },
  { label: "My Bookings", href: "/guest/booking" },
  { label: "About", href: "/about" },
]

export default function GuestTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isRestoring = useAuthStore((s) => s.isRestoring)
  const logout = useAuthStore((s) => s.logout)

  const isGuestContextPage = pathname.startsWith("/guest");
  const isGuestUser = user?.role?.toLowerCase() === "guest";
  const guestUser = isGuestUser ? user : null;

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifMenuRef = useRef<HTMLDivElement>(null)
  const lastSeenNotifId = useRef<number>(0)

  const [mounted, setMounted] = useState(false)
  
  const fetchNotifications = async (isPolling = false) => {
    try {
      const data = await notificationApi.getNotifications()
      const unread = data.filter((n) => n.isRead === false || (n as any).read === false)
      
      if (isPolling) {
        const newNotifs = unread.filter(n => n.id > lastSeenNotifId.current);
        if (newNotifs.length > 0) {
          newNotifs.forEach(notif => {
            toast.info(notif.title, {
              description: notif.message,
              position: "top-right",
              duration: 5000,
            });
          });
        }
      }
      
      if (unread.length > 0) {
        lastSeenNotifId.current = Math.max(...unread.map(n => n.id));
      }

      setNotifications(unread)
      setUnreadCount(unread.length)
    } catch (e) {
      console.error("Failed to fetch notifications", e)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (guestUser) {
      fetchNotifications()
      const intervalId = setInterval(() => {
        fetchNotifications(true)
      }, 10000)
      return () => clearInterval(intervalId)
    }
  }, [guestUser])

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      const updated = notifications.filter(n => n.id !== id)
      setNotifications(updated)
      setUnreadCount(updated.length)
    } catch (e) {
      console.error("Failed to mark as read", e)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications([])
      setUnreadCount(0)
    } catch (e) {
      console.error("Failed to mark all as read", e)
    }
  }


  const isSearchPage = pathname.startsWith("/guest/search")

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (accountMenuOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [accountMenuOpen, notificationsOpen])

  const handleLogout = () => {
    setAccountMenuOpen(false)
    router.push(`/auth/logout?redirect=${encodeURIComponent(pathname)}`)
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.profile) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0]">
      <div className={[
        "w-full px-4 h-16 flex items-center",
        isSearchPage ? "gap-4" : "justify-between",
      ].join(" ")}>

        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* ── Compact Search Bar (removed from search page header as requested) ── */}

        {/* ── Nav + Auth/Account ── */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive =
                pathname === href ||
                (href === "/guest/search" && pathname.startsWith("/guest/search")) ||
                (href === "/guest/booking" && pathname.startsWith("/guest/booking"))
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "text-[15px] font-medium no-underline transition-colors duration-200 pb-0.5 whitespace-nowrap",
                    isActive
                      ? "text-[#953002] border-b-2 border-[#953002]"
                      : "text-[#4f4f4f] hover:text-[#953002]",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Auth buttons OR Account avatar */}
          {!mounted || (isRestoring && !guestUser) ? (
            <div className="w-24 h-9 bg-gray-100 animate-pulse rounded-lg" />
          ) : guestUser ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setNotificationsOpen(prev => !prev)}
                  className="relative p-2 text-[#4f4f4f] hover:text-[#1d1d1d] hover:bg-[#f5f5f5] rounded-full transition-colors"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-[20px] bg-[#FFC107] rounded-full border-2 border-white text-[11px] font-bold text-black px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e8e8e8] py-2 z-60 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-4 py-2.5 border-b border-[#f0f0f0] flex justify-between items-center">
                      <p className="text-[14px] font-bold text-[#1d1d1d]">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs text-[#953002] font-semibold hover:underline">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-[#828282]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className="group relative px-4 py-3 border-b border-[#f0f0f0] last:border-0 bg-[#fdfaf6] hover:bg-[#f2e7d9] transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[13px] font-bold text-[#1d1d1d] pr-6">{notif.title}</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id) }}
                                className="absolute right-3 top-3 p-1 text-[#828282] hover:text-[#953002] hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                title="Mark as read"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-[12px] text-[#4f4f4f] leading-snug">{notif.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-[10px] text-[#828282]">
                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id) }}
                                className="text-[11px] font-semibold text-[#953002] md:hidden"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="relative w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold ring-2 ring-[#953002]/20 cursor-pointer hover:ring-4 transition-all overflow-hidden"
                aria-label="Account menu"
              >
                {guestUser?.profile?.avatarUrl ? (
                  <img src={guestUser.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27AE60] border-2 border-white" />
              </button>

              {/* Account dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e8e8e8] py-2 z-60 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
                    <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                      {guestUser!.profile ? `${guestUser!.profile.firstName} ${guestUser!.profile.lastName}` : guestUser!.email}
                    </p>
                    <p className="text-[11px] text-[#828282] truncate">{guestUser!.email}</p>
                  </div>

                  <Link
                    href="/guest/profile"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#4f4f4f] hover:bg-[#f8f8f8] hover:text-[#953002] transition-colors no-underline"
                  >
                    <Settings size={15} /> Profile Settings
                  </Link>

                  <div className="border-t border-[#f0f0f0] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={`/auth/register?role=guest&redirect=${encodeURIComponent(pathname)}`}
                className="px-4 py-2 text-sm font-semibold text-[#953002] border-2 border-[#953002] rounded-lg hover:bg-[#953002]/5 transition-colors no-underline whitespace-nowrap"
              >
                Register
              </Link>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#953002] rounded-lg hover:bg-[#6d2200] transition-colors no-underline whitespace-nowrap"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#1d1d1d] ml-auto"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e0e0e0] bg-white px-6 py-4 flex flex-col gap-4">
          {/* Compact search removed from mobile search page header as requested */}

          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={[
                "text-[15px] font-medium no-underline py-2",
                pathname === href ? "text-[#953002]" : "text-[#333333]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}

          {/* Mobile: auth buttons or account info */}
          {!mounted ? null : guestUser ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e0e0]">
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 overflow-hidden">
                  {guestUser?.profile?.avatarUrl ? (
                    <img src={guestUser.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                    {guestUser!.profile ? `${guestUser!.profile.firstName} ${guestUser!.profile.lastName}` : guestUser!.email}
                  </p>
                  <p className="text-[11px] text-[#828282] truncate">{guestUser!.email}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false) }}
                className="px-4 py-2 text-sm font-semibold text-center text-red-500 border-2 border-red-400 rounded-lg cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e0e0]">
              <Link href={`/auth/register?role=guest&redirect=${encodeURIComponent(pathname)}`} className="px-4 py-2 text-sm font-semibold text-center text-[#953002] border-2 border-[#953002] rounded-lg no-underline">
                Register
              </Link>
              <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`} className="px-4 py-2 text-sm font-semibold text-center text-white bg-[#953002] rounded-lg no-underline">
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
