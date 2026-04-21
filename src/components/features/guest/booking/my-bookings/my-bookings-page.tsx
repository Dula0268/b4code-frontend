"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin,
    MessageSquare,
    Pencil,
    XCircle,
    Download,
    Star,
    ChevronRight,
    RefreshCw,
    FileText,
    BedDouble,
    Bell,
    CreditCard,
    Wallet,
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore, type StoredBooking, type BookingStatus } from "@/store/guest/booking/booking.store"

// ─── Types ────────────────────────────────────────────────────────────────────
interface DisplayBooking {
    id: string
    propertyId?: string
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
    paymentMethod?: "online" | "property"
    paidInFull?: boolean
    roomName?: string
    bookingStatus?: string
    cancellationNote?: string
    isFromStore?: boolean
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: DisplayBooking[] = [
    {
        id: "bk-mock-1",
        propertyId: "1",
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
        paymentMethod: "online",
        paidInFull: true,
    },
    {
        id: "bk-mock-2",
        propertyId: "2",
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
        paymentMethod: "online",
        paidInFull: true,
    },
    {
        id: "bk-mock-3",
        propertyId: "3",
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
        paymentMethod: "property",
        paidInFull: false,
    },
]

// ─── Tabs — NO "ALL" tab ──────────────────────────────────────────────────────
const TABS = ["UPCOMING", "COMPLETED", "CANCELLED"] as const
type Tab = (typeof TABS)[number]

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<BookingStatus, string> = {
    UPCOMING: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200",
    CANCELLED: "bg-[#f5f5f5] text-[#757575] border border-[#e0e0e0]",
}

function StatusBadge({ status }: { status: BookingStatus }) {
    return (
        <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${STATUS_STYLES[status]}`}>
            {status}
        </span>
    )
}

// ─── Payment badge ────────────────────────────────────────────────────────────
function PaymentBadge({ paidInFull }: { paidInFull: boolean }) {
    if (paidInFull) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                <CreditCard size={10} /> Paid
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <Wallet size={10} /> Pay at Property
        </span>
    )
}

// ─── Shared button styles ─────────────────────────────────────────────────────
const BTN_PRIMARY   = "inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const BTN_OUTLINE   = "inline-flex items-center gap-2 border border-[#d0d0d0] hover:border-[#1a1a1a] text-[#444] hover:text-[#1a1a1a] text-[12px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const BTN_HOST      = "inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-amber-400 text-[12px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const BTN_RED       = "inline-flex items-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const BTN_GHOST     = "inline-flex items-center gap-1.5 text-[12px] font-bold text-[#888] hover:text-[#1a1a1a] transition-colors cursor-pointer ml-auto"

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: DisplayBooking }) {
    const isCancelled = booking.status === "CANCELLED"
    const isCompleted = booking.status === "COMPLETED"
    const isUpcoming  = booking.status === "UPCOMING"

    const cancelHref = booking.isFromStore
        ? `/guest/booking/cancel?bookingId=${encodeURIComponent(booking.id)}`
        : "/guest/booking/cancel"

    const rebookHref = booking.propertyId
        ? `/guest/property/${encodeURIComponent(booking.propertyId)}`
        : `/guest/search?property=${encodeURIComponent(booking.property)}&location=${encodeURIComponent(booking.location)}`

    return (
        <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">

            {/* Image */}
            <div className="relative w-full sm:w-[210px] h-[170px] sm:h-auto flex-shrink-0">
                <Image
                    src={booking.imageSrc}
                    alt={booking.property}
                    fill
                    className={`object-cover ${isCancelled ? "grayscale opacity-60" : ""}`}
                    sizes="(max-width: 640px) 100vw, 210px"
                />
                {/* Status pill over image */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status={booking.status} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col gap-3">

                {/* Order + price row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {booking.paidInFull !== undefined && !isCancelled && (
                            <PaymentBadge paidInFull={booking.paidInFull} />
                        )}
                        <span className="text-[11px] text-[#aaa] font-semibold">#{booking.orderNumber}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className={`text-[19px] font-black leading-tight ${isCancelled ? "text-[#aaa]" : "text-[#1a1a1a]"}`}>
                            {formatLKR(booking.totalPrice)}
                        </p>
                        <p className="text-[10px] text-[#bbb] font-semibold">{booking.nightsLabel}</p>
                    </div>
                </div>

                {/* Property name + location */}
                <div>
                    <h3 className="text-[16px] font-black text-[#1a1a1a] leading-snug">{booking.property}</h3>
                    {booking.roomName && (
                        <p className="text-[12px] font-semibold text-[#666] mt-0.5">{booking.roomName}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-[#bbb] flex-shrink-0" />
                        <p className="text-[12px] text-[#888]">{booking.location}</p>
                    </div>
                </div>

                {/* Cancellation note */}
                {isCancelled && booking.cancellationNote && (
                    <p className="text-[12px] text-[#888] leading-relaxed bg-[#f8f7f5] rounded-xl px-3 py-2.5 border border-[#ebebeb]">
                        {booking.cancellationNote}
                    </p>
                )}

                {/* Dates + guests (upcoming & completed) */}
                {!isCancelled && (
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-0.5">Stay Dates</p>
                            <p className="text-[12px] font-bold text-[#1a1a1a]">
                                {booking.checkIn} – {booking.checkOut}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-0.5">
                                {isCompleted ? "Status" : "Guests"}
                            </p>
                            <p className={`text-[12px] font-bold ${isCompleted ? "text-emerald-600" : "text-[#1a1a1a]"}`}>
                                {isCompleted ? booking.bookingStatus : booking.guests}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Action buttons ────────────────────────────────────── */}
                <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">

                    {isUpcoming && (
                        <>
                            {/* My Room — black filled */}
                            <Link href="/guest/my-room" className={BTN_PRIMARY}>
                                <BedDouble size={13} /> My Room
                            </Link>

                            {/* Message Host — black with amber accent */}
                            <Link href="/guest/booking/message-host" className={BTN_HOST}>
                                <MessageSquare size={13} /> Message Host
                            </Link>

                            {/* Modify — clean outline */}
                            <Link href="/guest/booking/modify" className={BTN_OUTLINE}>
                                <Pencil size={12} /> Modify
                            </Link>

                            {/* Cancel — soft red */}
                            <Link href={cancelHref} className={BTN_RED}>
                                <XCircle size={13} /> Cancel
                            </Link>
                        </>
                    )}

                    {isCompleted && (
                        <>
                            {/* Download Invoice */}
                            <Link href="/guest/booking/confirmation" className={BTN_OUTLINE}>
                                <Download size={13} /> Download Invoice
                            </Link>

                            {/* Rate Stay */}
                            <Link href="/guest/my-room/submit-review" className={BTN_OUTLINE}>
                                <Star size={13} /> Rate Stay
                            </Link>

                            {/* View Details ghost */}
                            <Link href="/guest/booking/confirmation" className={BTN_GHOST}>
                                View Details <ChevronRight size={13} />
                            </Link>
                        </>
                    )}

                    {isCancelled && (
                        <>
                            {/* Rebook */}
                            <Link href={rebookHref} className={BTN_PRIMARY}>
                                <RefreshCw size={13} /> Rebook Property
                            </Link>

                            {/* Cancellation Policy */}
                            <Link href="/guest/booking/cancel" className={BTN_OUTLINE}>
                                <FileText size={13} /> Cancellation Policy
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Convert store booking → display ─────────────────────────────────────────
function storeToDisplay(b: StoredBooking): DisplayBooking {
    return {
        id: b.id,
        propertyId: b.propertyId,
        orderNumber: b.confirmationCode,
        status: b.status,
        property: b.property,
        location: b.location ? `${b.location}, Sri Lanka` : "Sri Lanka",
        imageSrc: b.imageSrc,
        checkIn: b.checkInFormatted,
        checkOut: b.checkOutFormatted,
        guests: b.guestsLabel,
        totalPrice: b.totalPrice,
        nightsLabel: b.nightsLabel,
        paymentMethod: b.paymentMethod,
        paidInFull: b.paidInFull,
        roomName: b.roomName,
        isFromStore: true,
    }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("UPCOMING")
    const user = useAuthStore((s) => s.user)
    const storeBookings = useGuestBookingStore((s) => s.bookings)

    const [allBookings, setAllBookings] = useState<DisplayBooking[]>(MOCK_BOOKINGS)

    useEffect(() => {
        const userBookings = user?.email
            ? storeBookings.filter((b) => b.userEmail.toLowerCase() === user.email.toLowerCase())
            : storeBookings
        const converted = userBookings.map(storeToDisplay)
        setAllBookings([...converted, ...MOCK_BOOKINGS])
    }, [storeBookings, user])

    const filtered = allBookings.filter((b) => b.status === activeTab)

    const upcomingBookings = allBookings.filter((b) => b.status === "UPCOMING")
    const nearestUpcoming  = upcomingBookings.length > 0 ? upcomingBookings[0] : null

    return (
        <div className="min-h-screen bg-[#f4f4f2] pt-20 pb-16 font-sans">
            <div className="max-w-[860px] mx-auto px-4">

                {/* Page header */}
                <div className="pt-8 pb-6">
                    <h1 className="text-[30px] font-black text-[#1a1a1a] leading-tight">My Bookings</h1>
                    <p className="text-[14px] text-[#888] mt-1 font-medium">
                        Track your stays and manage upcoming travel plans.
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 mb-6 bg-white rounded-2xl border border-[#ebebeb] p-1 shadow-sm w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={[
                                "px-5 py-2 text-[12px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer",
                                activeTab === tab
                                    ? "bg-[#1a1a1a] text-white shadow-sm"
                                    : "text-[#888] hover:text-[#1a1a1a]",
                            ].join(" ")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Upcoming reminder banner */}
                {activeTab === "UPCOMING" && nearestUpcoming && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Bell size={17} className="text-amber-600 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[14px] font-black text-[#1a1a1a]">Upcoming stay!</h3>
                            <p className="text-[12px] text-[#666] mt-0.5 leading-relaxed">
                                Your trip to <strong>{nearestUpcoming.property}</strong> is coming up ({nearestUpcoming.checkIn} – {nearestUpcoming.checkOut}).
                                {nearestUpcoming.paidInFull === false && " Bring a valid ID for payment at check-in."}
                            </p>
                        </div>
                        <Link href="/guest/my-room" className="hidden sm:inline-flex text-[12px] font-black text-[#1a1a1a] hover:text-amber-600 whitespace-nowrap transition-colors no-underline">
                            View Room →
                        </Link>
                    </div>
                )}

                {/* Booking cards */}
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-[20px] border border-[#ebebeb] p-12 text-center">
                            <p className="text-[#aaa] text-[15px] font-semibold mb-3">No {activeTab.toLowerCase()} bookings.</p>
                            <Link href="/guest/search"
                                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1a1a1a] hover:text-amber-600 transition-colors no-underline">
                                Browse Properties <ChevronRight size={13} />
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
