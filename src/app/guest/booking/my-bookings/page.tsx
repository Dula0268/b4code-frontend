"use client"

import Link from "next/link"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import BookingCard from "@/components/guest/booking/booking-card"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import { useAuthStore } from "@/store/auth/auth.store"
import { useEffect, useState } from "react"

export default function MyBookingsPage() {
    const user = useAuthStore(s => s.user)
    const bookings = useGuestBookingStore(s => s.bookings)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])
    const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED">("ALL")

    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fafafa]">
                <GuestTopbar />
                <main className="flex-1 w-full px-6 xl:px-12 py-10 mt-16 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#9a3300] border-t-transparent rounded-full animate-spin"></div>
                </main>
                <GuestFooter />
            </div>
        )
    }

    const userBookings = bookings.filter(b => b.userEmail === user?.email)
    const filteredBookings = activeTab === "ALL" ? userBookings : userBookings.filter(b => b.status === activeTab)

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1 w-full px-6 xl:px-12 py-10 mt-16">
                <h1 className="text-[32px] font-bold text-[#1d1d1d] mb-2">My Bookings</h1>
                <p className="text-[14px] text-[#555] mb-6">View and manage all your upcoming and past stays.</p>
                
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {["ALL", "UPCOMING", "COMPLETED", "CANCELLED"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === tab 
                                    ? "bg-[#9a3300] text-white" 
                                    : "bg-white border border-[#e8e8e8] text-[#555] hover:border-[#9a3300] hover:text-[#9a3300]"
                            }`}
                        >
                            {tab === "ALL" ? "All Bookings" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {userBookings.length === 0 ? (
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-[#888] mb-4">You have no bookings yet.</p>
                        <Link href="/guest/search" className="inline-block bg-[#9c3100] hover:bg-[#852900] text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md">
                            Explore Properties
                        </Link>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-[#888] mb-4">No {activeTab.toLowerCase()} bookings found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredBookings.map(booking => (
                            <BookingCard 
                                key={booking.id} 
                                booking={{
                                    ...booking,
                                    orderId: booking.confirmationCode,
                                    guests: booking.guestsLabel
                                }} 
                            />
                        ))}
                    </div>
                )}
            </main>
            <GuestFooter variant="full" />
        </div>
    )
}
