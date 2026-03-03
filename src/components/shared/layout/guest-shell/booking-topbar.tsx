"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarCheck, BedDouble, User } from "lucide-react"
import Logo from "@/components/shared/branding/logo"

const NAV_ITEMS = [
    { label: "My Bookings", href: "/guest/order/my-orders", icon: CalendarCheck },
    { label: "My Room", href: "/guest/property/1", icon: BedDouble },
]

export default function BookingTopbar() {
    const pathname = usePathname()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0]">
            <div className="w-full px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex-shrink-0">
                    <Logo />
                </div>

                {/* Nav + Avatar */}
                <div className="flex items-center gap-6">
                    <nav className="hidden sm:flex items-center gap-5">
                        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                            const isActive = pathname.startsWith(href)
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={[
                                        "inline-flex items-center gap-1.5 text-[14px] font-medium no-underline transition-colors duration-200 pb-0.5 whitespace-nowrap",
                                        isActive
                                            ? "text-[#953002] border-b-2 border-[#953002]"
                                            : "text-[#4f4f4f] hover:text-[#953002]",
                                    ].join(" ")}
                                >
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User avatar */}
                    <div className="relative w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold ring-2 ring-[#953002]/20 cursor-pointer hover:ring-4 transition-all">
                        <User size={17} />
                        {/* Online dot */}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27AE60] border-2 border-white" />
                    </div>
                </div>
            </div>
        </header>
    )
}
