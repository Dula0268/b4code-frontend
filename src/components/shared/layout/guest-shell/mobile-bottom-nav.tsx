"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, User, CalendarCheck, Info, X, LogOut, Search } from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { toast } from "sonner"

const TABS = [
  { label: "Home",     icon: Home,         href: "/" },
  { label: "Search",   icon: Search,       href: "/guest/search" },
  { label: "Bookings", icon: CalendarCheck, href: "/guest/booking" },
  { label: "About",    icon: Info,          href: "/about" },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string | null) => {
    if (!href) return false
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── BOTTOM NAV BAR ── */}
      <nav
        style={{
          position: "fixed",
          bottom: "24px",
          left: "16px",
          right: "16px",
          zIndex: 9999,
        }}
        className="md:hidden flex justify-center"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            height: "68px",
            backgroundColor: "#ffffff",
            borderRadius: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid #dcdcdc",
            position: "relative",
          }}
        >
          {TABS.map((tab) => {
            const active = isActive(tab.href)
            const Icon = tab.icon
            const handleClick = () => {
              // No-op for now since Profile is removed
            }

            const inner = (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  height: "100%",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {active ? (
                  <>
                    <Icon size={24} color="#953002" strokeWidth={2.5} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#953002",
                        marginTop: "4px",
                      }}
                    >
                      {tab.label}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon size={24} color="#9ca3af" strokeWidth={2} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </div>
            )

            if (tab.href === null) {
              return (
                <button
                  key={tab.label}
                  onClick={handleClick}
                  style={{ flex: 1, height: "100%", background: "none", border: "none", padding: 0 }}
                >
                  {inner}
                </button>
              )
            }

            return (
              <Link
                key={tab.label}
                href={tab.href}
                style={{ flex: 1, height: "100%", display: "flex" }}
                onClick={handleClick}
              >
                {inner}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
