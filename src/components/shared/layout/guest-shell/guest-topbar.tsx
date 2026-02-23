"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Logo from "@/components/shared/branding/logo"
import SearchBar from "@/components/features/guest/booking/search/search-bar"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/guest/search" },
  { label: "About", href: "/about" },
]

export default function GuestTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isSearchPage = pathname.startsWith("/guest/search")

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

        {/* ── Nav + Auth buttons ── */}
        <div className={[
          "hidden md:flex items-center gap-6",
          !isSearchPage && "ml-auto",
        ].join(" ")}>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href || (href === "/guest/search" && pathname.startsWith("/guest/search"))
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

          <div className="flex items-center gap-3">
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-semibold text-[#953002] border-2 border-[#953002] rounded-lg hover:bg-[#953002]/5 transition-colors no-underline whitespace-nowrap"
            >
              Register
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#953002] rounded-lg hover:bg-[#6d2200] transition-colors no-underline whitespace-nowrap"
            >
              Login
            </Link>
          </div>
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
          <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e0e0]">
            <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold text-center text-[#953002] border-2 border-[#953002] rounded-lg no-underline">
              Register
            </Link>
            <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-center text-white bg-[#953002] rounded-lg no-underline">
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}