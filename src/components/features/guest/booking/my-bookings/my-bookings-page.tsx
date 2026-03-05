"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin,
    CalendarDays,
    Users,
    MessageSquare,
    Pencil,
    XCircle,
    Download,
    Star,
    ChevronRight,
    RefreshCw,
    FileText,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "UPCOMING" | "COMPLETED" | "CANCELLED"

interface Booking {
    id: string
    orderNumber: string
    status: BookingStatus
    property: string
    location: string
    imageSrc: string
    checkIn: string
    checkOut: string
    guests: string
    totalPrice: number
    nightsLabel: string
    // completed specific
    bookingStatus?: string
    // cancelled specific
    cancellationNote?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BOOKINGS: Booking[] = [
    {
        id: "bk1",
        orderNumber: "BK-88291",
        status: "UPCOMING",
        property: "Oceanview Luxury Retreat",
        location: "Maui, Hawaii",
        imageSrc: "/images/booking/resort-maui.png",
        checkIn: "Oct 12",
        checkOut: "Oct 15, 2023",
        guests: "2 Adults, 1 Child",
        totalPrice: 25_000,
        nightsLabel: "Total for 3 nights",
    },
    {
        id: "bk2",
        orderNumber: "BK-77210",
        status: "COMPLETED",
        property: "Mountain Peaks Chalet",
        location: "Aspen, Colorado",
        imageSrc: "/images/booking/mountain-chalet.png",
        checkIn: "Sep 05",
        checkOut: "Sep 08, 2023",
        guests: "2 Adults",
        totalPrice: 30_000,
        nightsLabel: "Total for 3 nights",
        bookingStatus: "Checked Out",
    },
    {
        id: "bk3",
        orderNumber: "BK-10293",
        status: "CANCELLED",
        property: "Skyline Loft Apartments",
        location: "New York, NY",
        imageSrc: "/images/booking/city-apartment.png",
        checkIn: "Nov 01",
        checkOut: "Nov 05, 2023",
        guests: "2 Adults",
        totalPrice: 45_000,
        nightsLabel: "Total for 4 nights",
        cancellationNote:
            "Booking was cancelled on Aug 20, 2023. Refund of $450.00 processed to original payment method.",
    },
]

const TABS = ["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as const
type Tab = (typeof TABS)[number]

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<BookingStatus, string> = {
    UPCOMING: "bg-[#e8f5e9] text-[#2E7D32]",
    COMPLETED: "bg-[#e0f2f1] text-[#00796b]",
    CANCELLED: "bg-[#f5f5f5] text-[#757575]",
}

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${STATUS_STYLES[status]}`}>
            {status}
        </span>
    )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: Booking }) {
    const isCancelled = booking.status === "CANCELLED"
    const isCompleted = booking.status === "COMPLETED"
    const isUpcoming = booking.status === "UPCOMING"

    return (
        <div className={`bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)]`}>
            {/* Image */}
            <div className="relative w-full sm:w-[220px] h-[180px] sm:h-auto flex-shrink-0">
                <Image
                    src={booking.imageSrc}
                    alt={booking.property}
                    fill
                    className={`object-cover ${isCancelled ? "grayscale opacity-70" : ""}`}
                    sizes="(max-width: 640px) 100vw, 220px"
                />
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col gap-3">
                {/* Top row: badge + order + price */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge status={booking.status} />
                        <span className="text-[12px] text-[#828282]">Order #{booking.orderNumber}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className={`text-[20px] font-bold leading-tight ${isCancelled ? "text-[#828282]" : "text-[#953002]"}`}>
                            {formatLKR(booking.totalPrice)}
                        </p>
                        <p className="text-[11px] text-[#828282]">{booking.nightsLabel}</p>
                    </div>
                </div>

                {/* Property name + location */}
                <div>
                    <h3 className="text-[17px] font-bold text-[#1d1d1d] leading-snug">{booking.property}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#828282] flex-shrink-0" />
                        <p className="text-[13px] text-[#828282]">{booking.location}</p>
                    </div>
                </div>

                {/* Cancelled note */}
                {isCancelled && booking.cancellationNote && (
                    <p className="text-[13px] text-[#828282] leading-relaxed bg-[#fafafa] rounded-xl px-3 py-2.5 border border-[#f0f0f0]">
                        {booking.cancellationNote}
                    </p>
                )}

                {/* Details grid (upcoming & completed) */}
                {!isCancelled && (
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[11px] font-semibold text-[#828282] uppercase tracking-wide mb-0.5">Stay Dates</p>
                            <p className="text-[13px] font-semibold text-[#1d1d1d]">
                                {booking.checkIn} – {booking.checkOut}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-[#828282] uppercase tracking-wide mb-0.5">
                                {isCompleted ? "Status" : "Guests"}
                            </p>
                            <p className={`text-[13px] font-semibold ${isCompleted ? "text-[#27AE60]" : "text-[#1d1d1d]"}`}>
                                {isCompleted ? booking.bookingStatus : booking.guests}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-wrap mt-1">
                    {isUpcoming && (
                        <>
                            <Link
                                href="/guest/booking/message-host"
                                className="inline-flex items-center gap-2 bg-[#953002] hover:bg-[#6d2200] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer no-underline"
                            >
                                <MessageSquare size={14} /> Message Host
                            </Link>
                            <Link
                                href="/guest/booking/modify"
                                className="inline-flex items-center gap-2 border border-[#953002] text-[#953002] hover:bg-[#fff4eb] text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer no-underline"
                            >
                                <Pencil size={13} /> Modify
                            </Link>
                            <button className="inline-flex items-center gap-2 border border-red-400 text-red-500 hover:bg-red-50 text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                <XCircle size={14} /> Cancel
                            </button>
                        </>
                    )}

                    {isCompleted && (
                        <>
                            <button className="inline-flex items-center gap-2 border border-[#e0e0e0] hover:border-[#953002] hover:text-[#953002] text-[#555] text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                <Download size={13} /> Download Invoice
                            </button>
                            <button className="inline-flex items-center gap-2 border border-[#e0e0e0] hover:border-[#953002] hover:text-[#953002] text-[#555] text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                                <Star size={13} /> Rate Stay
                            </button>
                            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#828282] hover:text-[#953002] transition-colors cursor-pointer ml-auto">
                                View Details <ChevronRight size={14} />
                            </button>
                        </>
                    )}

                    {isCancelled && (
                        <>
                            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#953002] hover:underline cursor-pointer">
                                Rebook Property <RefreshCw size={13} />
                            </button>
                            <span className="text-[#e0e0e0]">|</span>
                            <button className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#828282] hover:text-[#1d1d1d] cursor-pointer">
                                <FileText size={13} /> Cancellation Policy
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("ALL")

    const filtered = activeTab === "ALL"
        ? BOOKINGS
        : BOOKINGS.filter((b) => b.status === activeTab)

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[860px] mx-auto px-4">

                {/* Page header */}
                <div className="pt-8 pb-6">
                    <h1 className="text-[28px] font-bold text-[#1d1d1d] leading-tight">My Bookings</h1>
                    <p className="text-[14px] text-[#828282] mt-1">
                        Keep track of your stays and manage your upcoming travel plans.
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-0 border-b border-[#e0e0e0] mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={[
                                "px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest transition-colors cursor-pointer border-b-2 -mb-px",
                                activeTab === tab
                                    ? "text-[#953002] border-[#953002]"
                                    : "text-[#828282] border-transparent hover:text-[#1d1d1d]",
                            ].join(" ")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-5">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-10 text-center">
                            <p className="text-[#828282] text-[15px]">No bookings found in this category.</p>
                            <Link href="/guest/search" className="mt-4 inline-block text-[13px] font-semibold text-[#953002] hover:underline">
                                Browse Properties →
                            </Link>
                        </div>
                    ) : (
                        filtered.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
