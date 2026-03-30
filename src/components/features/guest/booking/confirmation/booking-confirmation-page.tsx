"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    CheckCircle,
    MapPin,
    Map,
    Printer,
    Share2,
    CalendarDays,
    Users,
    CreditCard,
    Copy,
    ChevronRight,
    BedDouble,
    Info,
} from "lucide-react"

// ─── Mock booking data ────────────────────────────────────────────────────────
const MOCK_BOOKING = {
    confirmationCode: "AXB-1234567",
    property: {
        name: "Colombo Sky Residency",
        address: "32 Galle Road, Colombo 03, Sri Lanka",
        imageSrc: "/images/booking/resort-property.png",
        lat: 6.9088,
        lng: 79.8543,
    },
    checkIn: { date: "Mon, Oct 12", time: "After 3:00 PM" },
    checkOut: { date: "Fri, Oct 16", time: "Before 11:00 AM" },
    guests: 2,
    roomType: "Panoramic Grand Suite",
    totalPrice: 45_000,
    paidInFull: true,
    checkInInstructions:
        "This property offers self check-in via a smart keypad. Your unique access code will be sent to your email and Prime Stay messages 24 hours before your stay. The code will become active at 3:00 PM on Oct 12.",
}

const NEARBY_ACTIVITIES = [
    {
        id: "1",
        title: "Colombo City Surf",
        subtitle: "From LKR 8,500/person",
        imageSrc: "/images/booking/activity-surf.png",
    },
    {
        id: "2",
        title: "Vineyard Wine Tasting",
        subtitle: "From LKR 12,000/person",
        imageSrc: "/images/booking/activity-wine.png",
    },
    {
        id: "3",
        title: "Sunset Coastal Hike",
        subtitle: "From LKR 4,500/person",
        imageSrc: "/images/booking/activity-hike.png",
    },
]

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingConfirmationPage() {
    const [copied, setCopied] = useState(false)
    const booking = MOCK_BOOKING

    const handleCopy = () => {
        navigator.clipboard.writeText(`#${booking.confirmationCode}`).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handlePrint = () => window.print()

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[660px] mx-auto px-4 flex flex-col gap-6">

                {/* ── Success Header ────────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center pt-6 pb-2">
                    {/* Animated checkmark */}
                    <div className="relative w-[60px] h-[60px] mb-4">
                        <div className="absolute inset-0 rounded-full bg-[#d4edda] animate-ping opacity-40" />
                        <div className="relative w-[60px] h-[60px] rounded-full bg-[#d4edda] flex items-center justify-center">
                            <CheckCircle size={30} className="text-[#27AE60]" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1d1d1d] leading-tight mb-2">
                        Booking Confirmed
                    </h1>
                    <p className="text-[15px] text-[#828282] max-w-[380px]">
                        Pack your bags! Your stay at{" "}
                        <span className="font-semibold text-[#333]">{booking.property.name}</span>
                        {" "}is confirmed and ready for your arrival.
                    </p>
                </div>

                {/* ── Confirmation Card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] overflow-hidden">

                    {/* Card header — confirmation code */}
                    <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
                        <p className="text-[10px] font-semibold text-[#953002] uppercase tracking-widest mb-1">
                            Confirmation Details
                        </p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[22px] font-bold text-[#1d1d1d] tracking-tight">
                                    #{booking.confirmationCode}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    aria-label="Copy confirmation code"
                                    className="flex items-center gap-1 text-[#953002] hover:text-[#6d2200] transition-colors text-[13px] font-medium cursor-pointer"
                                >
                                    <Copy size={13} />
                                    <span>{copied ? "Copied!" : "Copy"}</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-[#828282]">
                                <button
                                    onClick={handlePrint}
                                    aria-label="Print booking"
                                    className="hover:text-[#1d1d1d] transition-colors cursor-pointer"
                                >
                                    <Printer size={18} />
                                </button>
                                <button
                                    aria-label="Share booking"
                                    className="hover:text-[#1d1d1d] transition-colors cursor-pointer"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Property info */}
                    <div className="p-5 flex gap-4 border-b border-[#f0f0f0]">
                        <div className="relative w-[140px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f3ede8]">
                            <Image
                                src={booking.property.imageSrc}
                                alt={booking.property.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1.5">
                            <h2 className="text-[17px] font-bold text-[#1d1d1d] leading-snug">
                                {booking.property.name}
                            </h2>
                            <div className="flex items-start gap-1.5">
                                <MapPin size={13} className="text-[#828282] mt-0.5 flex-shrink-0" />
                                <p className="text-[13px] text-[#828282] leading-snug">
                                    {booking.property.address}
                                </p>
                            </div>
                            <a
                                href={`https://www.google.com/maps?q=${booking.property.lat},${booking.property.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#953002] hover:text-[#6d2200] transition-colors no-underline mt-0.5"
                            >
                                <Map size={13} />
                                View on Map
                            </a>
                        </div>
                    </div>

                    {/* Stay details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-[#f0f0f0]">
                        {[
                            {
                                icon: CalendarDays,
                                label: "Check-In",
                                value: booking.checkIn.date,
                                sub: booking.checkIn.time,
                            },
                            {
                                icon: CalendarDays,
                                label: "Check-Out",
                                value: booking.checkOut.date,
                                sub: booking.checkOut.time,
                            },
                            {
                                icon: Users,
                                label: "Guests",
                                value: `${booking.guests} Adults`,
                                sub: booking.roomType,
                            },
                            {
                                icon: CreditCard,
                                label: "Total Price",
                                value: formatLKR(booking.totalPrice),
                                sub: booking.paidInFull ? "Paid in full" : "Pending",
                                valueClass: "text-[#1d1d1d]",
                                subClass: booking.paidInFull ? "text-[#27AE60] font-semibold" : "text-[#828282]",
                            },
                        ].map(({ icon: Icon, label, value, sub, valueClass, subClass }, i) => (
                            <div
                                key={label}
                                className={[
                                    "p-4 flex flex-col gap-1",
                                    i < 3 ? "border-r border-[#f0f0f0]" : "",
                                ].join(" ")}
                            >
                                <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className={`text-[14px] font-bold text-[#1d1d1d] leading-tight ${valueClass ?? ""}`}>
                                    {value}
                                </p>
                                <p className={`text-[12px] leading-tight ${subClass ?? "text-[#828282]"}`}>
                                    {sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Check-in instructions */}
                    <div className="mx-5 my-4 bg-[#fffbf5] border border-[#f5d9b5] rounded-xl p-4 flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <Info size={16} className="text-[#c97c2e]" />
                        </div>
                        <div>
                            <p className="text-[13px] font-semibold text-[#1d1d1d] mb-1">Check-in Instructions</p>
                            <p className="text-[12px] text-[#4f4f4f] leading-relaxed">
                                {booking.checkInInstructions}
                            </p>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/guest/my-room"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#953002] text-white rounded-xl px-5 py-3 text-[14px] font-semibold hover:bg-[#6d2200] transition-colors no-underline"
                        >
                            <BedDouble size={16} />
                            Go to Your Room
                        </Link>
                        <Link
                            href="/guest/booking/my-bookings"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#953002] text-white rounded-xl px-5 py-3 text-[14px] font-semibold hover:bg-[#6d2200] transition-colors no-underline"
                        >
                            <CalendarDays size={16} />
                            Visit Your Booking
                        </Link>
                    </div>
                </div>

                {/* ── Popular things nearby ─────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[17px] font-bold text-[#1d1d1d]">
                            Popular things to do nearby
                        </h3>
                        <button className="text-[13px] font-semibold text-[#953002] hover:text-[#6d2200] transition-colors flex items-center gap-0.5 cursor-pointer">
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {NEARBY_ACTIVITIES.map((activity) => (
                            <div
                                key={activity.id}
                                className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3ede8]">
                                    <Image
                                        src={activity.imageSrc}
                                        alt={activity.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-2.5">
                                    <p className="text-[13px] font-semibold text-[#1d1d1d] leading-tight">
                                        {activity.title}
                                    </p>
                                    <p className="text-[11px] text-[#828282] mt-0.5">
                                        {activity.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
