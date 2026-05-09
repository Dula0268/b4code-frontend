"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calendar, ChevronRight, Lock
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { paymentApi } from "@/lib/api"
import BookingCard, { type BookingCardData } from "@/components/features/guest/booking/booking-card"

const TABS: ("UPCOMING" | "COMPLETED" | "CANCELLED")[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING")
  const [bookings, setBookings] = useState<BookingCardData[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await paymentApi.getMyPayments();
        
        // Transform payment data into booking-like cards for the UI
        const mappedBookings: BookingCardData[] = data.map((p: {
          id: number;
          orderId: string;
          status: string;
          amount: number;
          paymentMethod: string;
        }) => ({
          id: String(p.id),
          orderId: p.orderId,
          orderNumber: p.orderId,
          status: p.status === "SUCCESS" ? "UPCOMING" : "CANCELLED",
          property: "Luxury Resort Stay", 
          location: "Colombo, Sri Lanka",
          imageSrc: "/images/properties/property-1.jpg",
          checkIn: "Jun 12, 2024",
          checkOut: "Jun 15, 2024",
          totalPrice: p.amount,
          paymentStatus: p.status,
          paymentMethod: p.paymentMethod,
          nightsLabel: "3 nights",
          guests: "2 Guests"
        }));
        
        setBookings(mappedBookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadBookings();
  }, [user]);

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
