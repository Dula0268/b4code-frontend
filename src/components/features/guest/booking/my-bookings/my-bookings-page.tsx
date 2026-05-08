"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Pencil, XCircle, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  Bell, CreditCard, Wallet, Lock, Calendar
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { paymentApi } from "@/lib/api"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Booking {
  id: string
  orderId: string
  status: "UPCOMING" | "COMPLETED" | "CANCELLED"
  property: string
  location: string
  imageSrc: string
  checkIn: string
  checkOut: string
  totalPrice: number
  paymentStatus: string
  paymentMethod: string
}

const TABS: ("UPCOMING" | "COMPLETED" | "CANCELLED")[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUCCESS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  return (
    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="relative group overflow-hidden rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/20 flex flex-col sm:flex-row">
      {/* Property Image */}
      <div className="relative w-full sm:w-56 h-48 sm:h-auto overflow-hidden">
        <Image
          src={booking.imageSrc}
          alt={booking.property}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Ref: {booking.orderId}
            </span>
            <div className="text-right">
              <p className="text-[18px] font-black text-white leading-tight">{formatLKR(booking.totalPrice)}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Total Price</p>
            </div>
          </div>

          <h3 className="text-[20px] font-black text-white mb-1 tracking-tight">{booking.property}</h3>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-white/60">
              <Calendar size={14} className="text-[#9a3300]" />
              <span className="text-[12px] font-medium">{booking.checkIn} — {booking.checkOut}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <MapPin size={14} className="text-[#9a3300]" />
              <span className="text-[12px] font-medium">{booking.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
          <Link 
            href={`/guest/booking/confirmation?orderId=${booking.orderId}`}
            className="h-10 px-5 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-[12px] font-black flex items-center gap-2 transition-all"
          >
            <FileText size={14} /> View Details
          </Link>
          <Link 
            href="#"
            className="h-10 px-5 border border-white/10 hover:border-[#9a3300] text-white/70 hover:text-[#9a3300] rounded-xl text-[12px] font-black flex items-center gap-2 transition-all"
          >
            <Download size={14} /> Invoice
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await paymentApi.getMyPayments();
        
        // Transform payment data into booking-like cards for the UI
        const mappedBookings = data.map((p: any) => ({
          id: String(p.id),
          orderId: p.orderId,
          status: p.status === "SUCCESS" ? "UPCOMING" : "CANCELLED",
          property: "Luxury Resort Stay", // Placeholder since payment doesn't store property name yet
          location: "Colombo, Sri Lanka",
          imageSrc: "/images/properties/property-1.jpg",
          checkIn: "Jun 12, 2024",
          checkOut: "Jun 15, 2024",
          totalPrice: p.amount,
          paymentStatus: p.status,
          paymentMethod: p.paymentMethod
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
