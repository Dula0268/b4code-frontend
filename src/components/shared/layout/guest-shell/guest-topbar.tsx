"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Logo from "@/components/shared/branding/logo"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "About", href: "/about" },
]

export default function GuestTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0]">
      <div className="w-full pl-4 pr-6 h-16 flex items-center justify-between">

        <Logo />

        <div className="hidden md:flex items-center gap-8 ml-auto">
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "text-[15px] font-medium no-underline transition-colors duration-200 pb-0.5",
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
              className="px-4 py-2 text-sm font-semibold text-[#953002] border-2 border-[#953002] rounded-lg hover:bg-[#953002]/5 transition-colors no-underline"
            >
              Register
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#953002] rounded-lg hover:bg-[#6d2200] transition-colors no-underline"
            >
              Login
            </Link>
          </div>
        </div>

        <button
          className="md:hidden p-2 text-[#1d1d1d] ml-auto"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#e0e0e0] bg-white px-6 py-4 flex flex-col gap-4">
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