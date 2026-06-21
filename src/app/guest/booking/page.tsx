"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calendar, ChevronRight, Lock
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { guestApi } from "@/api/guest/guest.api";
import { useGuestBookingStore, type BookingStatus } from "@/store/guest/booking/booking.store"
import BookingCard, { type BookingCardData } from "@/components/guest/booking/booking-card"
import { useGuestGuard } from "@/hooks/use-guest-guard"
import AccessDenied from "@/components/shared/auth/access-denied"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

const TABS: ("UPCOMING" | "COMPLETED" | "CANCELLED")[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

export default function MyBookingsPage() {
  const { status, userRole } = useGuestGuard()
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
                  confirmationCode?: string
                  propertyName?: string
                  propertyAddress?: string
                  propertyImage?: string
                  roomName?: string
                  guestName?: string
                  guestEmail?: string
                  adults?: number
                  checkIn?: string
                  checkOut?: string
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

                apiBookings = (data as ApiBooking[]).map((b) => {
                    const checkInDate = b.checkIn ? new Date(b.checkIn) : new Date();
                    const checkOutDate = b.checkOut ? new Date(b.checkOut) : new Date(checkInDate.getTime() + 86400000);
                    const diffDays = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
                    
                    return {
                        id: String(b.bookingId ?? b.id ?? b.confirmationCode ?? b.confirmationNumber ?? crypto.randomUUID()),
                        propertyId: String((b as any).propertyId ?? b.bookingId ?? b.id ?? ""),
                        orderId: b.confirmationCode || b.confirmationNumber || `BK-${String(b.bookingId ?? b.id ?? "")}`,
                        orderNumber: b.confirmationCode || b.confirmationNumber || `BK-${String(b.bookingId ?? b.id ?? "")}`,
                        status: normalizeStatus(b.status),
                        property: b.propertyName || "Prime Stay Property",
                        location: b.propertyAddress || "Sri Lanka",
                        imageSrc: b.propertyImage || "/images/properties/property-1.jpg",
                        checkIn: b.checkIn || "",
                        checkOut: b.checkOut || "",
                        guests: `${b.adults ?? 1} Guest${(b.adults ?? 1) > 1 ? "s" : ""}`,
                        totalPrice: b.totalAmount ?? 0,
                        nightsLabel: `${diffDays} night${diffDays > 1 ? "s" : ""}`,
                        paymentMethod: (b.paymentMethod === "PAY_AT_PROPERTY" ? "property" : "online") as "property" | "online",
                        paidInFull: b.paymentMethod !== "PAY_AT_PROPERTY",
                        roomName: b.roomName,
                        isFromStore: false,
                    };
                })
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
  
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Guest" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />

      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-16 pb-20">


        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#e8ddcf] rounded-[18px] backdrop-blur-md mb-12 w-fit animate-in fade-in slide-in-from-left-4 duration-700 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-[#9a3300] text-white shadow-lg shadow-[#9a3300]/20" 
                  : "text-[#8b7d6d] hover:text-[#2b2218]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Booking List */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#9f907f]">
              <div className="w-12 h-12 border-4 border-[#f0e4d5] border-t-[#9a3300] rounded-full animate-spin mb-4" />
              <p className="text-[12px] font-black uppercase tracking-widest">Loading Collection...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 rounded-[32px] bg-white border border-[#eadfce] border-dashed backdrop-blur-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#f7efe4] rounded-full flex items-center justify-center mb-6">
                <Calendar size={32} className="text-[#b8a895]" />
              </div>
              <h2 className="text-[20px] font-bold text-[#2b2218] mb-2">No bookings found</h2>
              <p className="text-[#847766] text-[14px] mb-8">Ready for your next adventure?</p>
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
            <Lock size={12} className="text-[#5e4f3f]" />
            <span className="text-[10px] font-black text-[#5e4f3f] uppercase tracking-widest">End-to-End Encrypted Portal</span>
          </div>
          <div className="h-[1px] w-12 bg-[#cdbba5] mb-4" />
          <p className="text-[9px] text-[#6f6254] text-center uppercase tracking-tighter">
            Prime Stay Luxury Hospitality Group &copy; 2024
          </p>
        </div>
      </div>
      <GuestFooter />
    </div>
  )
}
