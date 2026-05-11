"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, CalendarCheck, User, LogOut, Settings } from "lucide-react"
import Logo from "@/components/shared/branding/logo"
import SearchBar from "@/components/features/guest/search/search-bar"
import { useAuthStore } from "@/store/auth/auth.store"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/guest/search" },
  { label: "My Bookings", href: "/guest/booking/my-bookings" },
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

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])


  const isSearchPage = pathname.startsWith("/guest/search")

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [accountMenuOpen])

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

        {/* ── Compact Search Bar (search page only) ── */}
        {isSearchPage && (
          <div className="hidden md:flex flex-1 justify-center px-4">
            <Suspense fallback={<div className="h-10 w-[580px] rounded-xl bg-gray-100 animate-pulse" />}>
              <SearchBar variant="compact" />
            </Suspense>
          </div>
        )}

        {/* ── Nav + Auth/Account ── */}
        <div className={[
          "hidden md:flex items-center gap-6",
          !isSearchPage && "ml-auto",
        ].join(" ")}>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive =
                pathname === href ||
                (href === "/guest/search" && pathname.startsWith("/guest/search")) ||
                (href === "/guest/booking/my-bookings" && pathname.startsWith("/guest/booking"))
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
          {!mounted || (isRestoring && !user) ? (
            <div className="w-24 h-9 bg-gray-100 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="relative w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold ring-2 ring-[#953002]/20 cursor-pointer hover:ring-4 transition-all overflow-hidden"
                aria-label="Account menu"
              >
                {user?.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
                      {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                    </p>
                    <p className="text-[11px] text-[#828282] truncate">{user.email}</p>
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
          {/* Compact search on mobile search page */}
          {isSearchPage && (
            <div className="pb-2 border-b border-[#e0e0e0]">
              <Suspense fallback={<div className="h-10 rounded-xl bg-gray-100 animate-pulse" />}>
                <SearchBar variant="compact" />
              </Suspense>
            </div>
          )}

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
          {!mounted ? null : user ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e0e0]">
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 overflow-hidden">
                  {user?.profile?.avatarUrl ? (
                    <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                    {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                  </p>
                  <p className="text-[11px] text-[#828282] truncate">{user.email}</p>
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