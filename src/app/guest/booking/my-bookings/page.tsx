"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { XCircle, ChevronRight, Bell } from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore, type BookingStatus } from "@/store/guest/booking/booking.store"
import { guestApi } from "@/lib/api"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingCard, { type BookingCardData } from "@/components/features/guest/booking/booking-card"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
type Tab = BookingStatus
const TABS: Tab[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

// ─────────────────────────────────────────────────────────────────────────────
// Business Logic Hook
// ─────────────────────────────────────────────────────────────────────────────
function useMyBookingsLogic() {
  const [activeTab, setActiveTab] = useState<Tab>("UPCOMING")
  const [bookings, setBookings] = useState<BookingCardData[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const user = useAuthStore(s => s.user)
  const localBookings = useGuestBookingStore(s => s.bookings)

  useEffect(() => {
    let active = true
    async function loadBookings() {
        try {
            const email = user?.email
            if (!email) {
              if (active) setBookings([])
              return
            }

            let apiBookings: BookingCardData[] = []
            try {
                const data = await guestApi.getGuestBookings(email)
                type ApiBooking = {
                  bookingId?: number | string
                  id?: number | string
                  confirmationNumber?: string
                  propertyName?: string
                  propertyAddress?: string
                  roomName?: string
                  guestName?: string
                  guestEmail?: string
                  guestCount?: number
                  checkIn?: string
                  checkOut?: string
                  nights?: number
                  totalAmount?: number
                  status?: string
                  paymentMethod?: string
                  createdAt?: string
                }

                const normalizeStatus = (s?: string): BookingStatus => {
                  if (s === "COMPLETED") return "COMPLETED"
                  if (s === "CANCELLED") return "CANCELLED"
                  return "UPCOMING"
                }

                apiBookings = (data as ApiBooking[]).map((b) => ({
                    id: String(b.bookingId ?? b.id ?? b.confirmationNumber ?? crypto.randomUUID()),
                    propertyId: String(b.bookingId ?? b.id ?? ""),
                    orderNumber: b.confirmationNumber || `BK-${String(b.bookingId ?? b.id ?? "")}`,
                    status: normalizeStatus(b.status),
                    property: b.propertyName || "Prime Stay Property",
                    location: b.propertyAddress || "Sri Lanka",
                    imageSrc: "/images/properties/property-1.jpg",
                    checkIn: b.checkIn || "",
                    checkOut: b.checkOut || "",
                    guests: `${b.guestCount ?? 2} Guests`,
                    totalPrice: b.totalAmount ?? 0,
                    nightsLabel: `${b.nights ?? 1} night${(b.nights ?? 1) > 1 ? "s" : ""}`,
                    paymentMethod: (b.paymentMethod === "PAY_AT_PROPERTY" ? "property" : "online") as "property" | "online",
                    paidInFull: b.paymentMethod !== "PAY_AT_PROPERTY",
                    roomName: b.roomName,
                    isFromStore: false,
                }))
            } catch (err) {
                console.warn("API booking fetch failed or empty:", err)
            }

            if (active) {
                const userLocalBookings = localBookings.filter(b => b.userEmail.toLowerCase() === email.toLowerCase())
                const mappedLocal: BookingCardData[] = userLocalBookings.map(b => ({
                    id: String(b.id),
                    propertyId: String(b.propertyId),
                    orderNumber: b.confirmationCode,
                    status: b.status,
                    property: b.property,
                    location: b.location,
                    imageSrc: b.imageSrc,
                    checkIn: b.checkIn,
                    checkOut: b.checkOut,
                    guests: b.guestsLabel,
                    totalPrice: b.totalPrice,
                    nightsLabel: b.nightsLabel,
                    paymentMethod: b.paymentMethod,
                    paidInFull: b.paidInFull,
                    roomName: b.roomName,
                    isFromStore: true,
                }))

                const merged = [...mappedLocal]
                for (const apiB of apiBookings) {
                    if (!merged.find(m => m.orderNumber === apiB.orderNumber)) {
                        merged.push(apiB)
                    }
                }
                
                setBookings(merged)
            }
        } catch {
            if (active) setErrorMsg("Failed to synchronize bookings. Try again.")
        }
    }

    if (user) {
        loadBookings();
    } else {
        setBookings([]);
    }
    
    return () => { active = false }
  }, [user, localBookings])

  const visible = bookings.filter(b => b.status === activeTab)
  const nextUpcoming = bookings.find(b => b.status === "UPCOMING") ?? null

  return { activeTab, setActiveTab, bookings, errorMsg, visible, nextUpcoming }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const { activeTab, setActiveTab, errorMsg, visible, nextUpcoming } = useMyBookingsLogic()

  return (
    <div className="min-h-screen flex flex-col">
      <GuestTopbar />

      <main className="flex-1 pt-20 pb-16" style={{ background: "transparent" }}>
        <div className="max-w-[860px] mx-auto px-4">

          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between border border-red-200 shadow-sm">
               <div className="flex items-center gap-2">
                  <XCircle size={16} />
                  <p className="text-sm font-semibold">{errorMsg}</p>
               </div>
            </div>
          )}

          {/* Header */}
          <div className="pt-8 pb-6">
            <h1 className="text-[1.875rem] font-black leading-tight" style={{ color: "var(--fg)", fontSize: "1.875rem" }}>
              My Bookings
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: "var(--gray-3)" }}>
              Track your stays and manage upcoming travel plans.
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center gap-1 mb-6 ps-card w-full sm:w-fit p-1 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 sm:px-5 py-2 text-[0.75rem] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer whitespace-nowrap"
                style={{
                  background: activeTab === tab ? "var(--brand-primary)" : "transparent",
                  color:      activeTab === tab ? "white"          : "var(--gray-3)",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Upcoming reminder */}
          {activeTab === "UPCOMING" && nextUpcoming && (
            <div className="mb-6 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4 border border-amber-200 bg-amber-50">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bell size={17} className="text-amber-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black" style={{ color: "var(--fg)" }}>Upcoming stay!</h3>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--gray-2)" }}>
                  Your trip to <strong>{nextUpcoming.property}</strong> is coming up ({nextUpcoming.checkIn} – {nextUpcoming.checkOut}).
                  {nextUpcoming.paidInFull === false && " Bring a valid ID for payment at check-in."}
                </p>
              </div>
              <Link href="/guest/my-room"
                className="hidden sm:inline-flex text-xs font-black whitespace-nowrap no-underline transition-colors"
                style={{ color: "var(--fg)" }}>
                View Room →
              </Link>
            </div>
          )}

          {/* Booking list — uses the extracted BookingCard component */}
          <div className="flex flex-col gap-4">
            {visible.length === 0 ? (
              <div className="ps-card p-12 text-center">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--gray-4)" }}>
                  No {activeTab.toLowerCase()} bookings.
                </p>
                <Link href="/guest/search"
                  className="inline-flex items-center gap-1.5 text-sm font-bold no-underline transition-colors"
                  style={{ color: "var(--fg)" }}>
                  Browse Properties <ChevronRight size={13} />
                </Link>
              </div>
            ) : (
              visible.map(booking => <BookingCard key={booking.id} booking={booking} />)
            )}
          </div>

        </div>
      </main>

      <GuestFooter />
    </div>
  )
}
