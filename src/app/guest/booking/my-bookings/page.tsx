"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calendar, ChevronRight, Lock
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { guestApi } from "@/lib/api"
import { useGuestBookingStore, type BookingStatus } from "@/store/guest/booking/booking.store"
import BookingCard, { type BookingCardData } from "@/components/features/guest/booking/booking-card"

const TABS: ("UPCOMING" | "COMPLETED" | "CANCELLED")[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING")
  const [bookings, setBookings] = useState<BookingCardData[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)
  const localBookings = useGuestBookingStore(s => s.bookings)

  useEffect(() => {
    async function loadBookings() {
        try {
            const email = user?.email
            if (!email) {
              setBookings([])
              setLoading(false)
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
                    orderId: b.confirmationNumber || `BK-${String(b.bookingId ?? b.id ?? "")}`,
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

            const userLocalBookings = localBookings.filter(b => b.userEmail.toLowerCase() === email.toLowerCase())
            const mappedLocal: BookingCardData[] = userLocalBookings.map(b => ({
                id: String(b.id),
                propertyId: String(b.propertyId),
                orderId: b.confirmationCode,
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

            // Local store bookings take full priority (they have the latest status including cancellations)
            const merged = [...mappedLocal]
            for (const apiB of apiBookings) {
                // Skip API bookings that already exist in local store (by orderNumber or id)
                const existsLocally = merged.find(m =>
                    m.orderNumber === apiB.orderNumber || m.id === apiB.id
                )
                if (!existsLocally) {
                    merged.push(apiB)
                }
            }
            
            setBookings(merged)
        } catch (err) {
            console.error("Failed to synchronize bookings:", err)
        } finally {
            setLoading(false)
        }
    }

    if (user) loadBookings();
  }, [user, localBookings]);

  return (
    <div className="min-h-screen relative bg-[#0a0a0a] overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/payment_page_background_1778058273069.png"
          alt="Luxury background"
          fill
          className="object-cover opacity-40 scale-105 blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-1 bg-[#9a3300] rounded-full" />
            <span className="text-[12px] font-black text-[#9a3300] uppercase tracking-[0.2em]">Guest Portal</span>
          </div>
          <h1 className="text-[42px] font-black text-white leading-none tracking-tight mb-4">
            My Luxury <span className="text-white/40 italic font-medium">Stays</span>
          </h1>
          <p className="text-white/50 text-[15px] font-medium max-w-md leading-relaxed">
            Manage your upcoming escapes and relive your past memories with Prime Stay.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-[18px] backdrop-blur-md mb-8 w-fit animate-in fade-in slide-in-from-left-4 duration-700">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-[#9a3300] text-white shadow-lg shadow-[#9a3300]/20" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Booking List */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-white/20">
              <div className="w-12 h-12 border-4 border-white/5 border-t-[#9a3300] rounded-full animate-spin mb-4" />
              <p className="text-[12px] font-black uppercase tracking-widest">Loading Collection...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 rounded-[32px] bg-white/5 border border-white/10 border-dashed backdrop-blur-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Calendar size={32} className="text-white/20" />
              </div>
              <h2 className="text-[20px] font-bold text-white mb-2">No bookings found</h2>
              <p className="text-white/40 text-[14px] mb-8">Ready for your next adventure?</p>
              <Link 
                href="/guest/search"
                className="h-12 px-8 bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-xl font-black text-[13px] flex items-center gap-2 transition-all shadow-xl shadow-[#9a3300]/20"
              >
                Discover Properties <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            bookings
              .filter(b => b.status === activeTab)
              .map(booking => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>

        {/* Footer info */}
        <div className="mt-20 flex flex-col items-center opacity-30">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={12} className="text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">End-to-End Encrypted Portal</span>
          </div>
          <div className="h-[1px] w-12 bg-white/20 mb-4" />
          <p className="text-[9px] text-white/50 text-center uppercase tracking-tighter">
            Prime Stay Luxury Hospitality Group &copy; 2024
          </p>
        </div>
      </div>
    </div>
  )
}
