"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Download, Printer, CheckCircle2 } from "lucide-react"
import { guestApi } from "@/api/guest/guest.api"

export default function BookingReceiptClient({ id }: { id: string }) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        const b = await guestApi.getBookingByConfirmation(id)
        setBooking(b)
      } catch (error) {
        console.error("Failed to load booking details:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [id])

  if (loading || !booking) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded-xl mb-6"></div>
      </div>
    )
  }

  const formatLKR = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-[800px] mx-auto pb-16 relative">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link href={`/guest/booking`} className="inline-flex items-center gap-2 text-sm font-bold no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors">
          <ChevronLeft size={16} /> Back to Bookings
        </Link>
        <button 
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
        >
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b border-[#f2e7d9] pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1d1d1d] tracking-tight">PrimeStay</h1>
            <p className="text-sm text-[#828282] mt-1 font-medium">Booking Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#828282] uppercase tracking-widest mb-1">Confirmation Code</p>
            <p className="text-xl font-black text-[#1d1d1d]">{booking.confirmationCode}</p>
            <p className="text-xs text-[#828282] mt-2">Issued: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Property Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-[#828282] uppercase tracking-widest mb-3">Guest Details</h3>
            <p className="text-sm font-medium text-[#1d1d1d]">{booking.guestEmail}</p>
            <p className="text-sm font-medium text-[#1d1d1d] mt-1">{booking.adults} {booking.adults === 1 ? 'Guest' : 'Guests'}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#828282] uppercase tracking-widest mb-3">Property Details</h3>
            <p className="text-sm font-bold text-[#1d1d1d]">{booking.propertyName}</p>
            <p className="text-sm font-medium text-[#828282] mt-1">{booking.propertyAddress}</p>
            {booking.roomName && (
              <p className="text-sm font-medium text-[#828282] mt-1">{booking.roomQuantity || 1}x {booking.roomName}</p>
            )}
          </div>
        </div>

        {/* Stay Dates */}
        <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-2xl p-6 mb-8 flex justify-between items-center print:bg-white print:border-y print:border-x-0 print:rounded-none">
          <div>
            <p className="text-xs font-bold text-[#828282] uppercase tracking-widest mb-1">Check-in</p>
            <p className="text-base font-black text-[#1d1d1d]">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#828282] uppercase tracking-widest mb-1">Check-out</p>
            <p className="text-base font-black text-[#1d1d1d]">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h3 className="text-lg font-black text-[#1d1d1d] mb-4">Payment Summary</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#828282] font-medium">Base Price</span>
              <span className="text-[#1d1d1d] font-bold">{formatLKR(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[#f2e7d9] mt-2">
              <span className="text-base text-[#1d1d1d] font-black">Total Paid</span>
              <span className="text-xl text-[#1d1d1d] font-black">{formatLKR(booking.totalAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Status */}
        <div className="mt-8 flex items-center gap-2">
           {booking.paymentMethod !== "PAY_AT_PROPERTY" ? (
             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
               <CheckCircle2 size={18} />
               <span className="text-sm font-bold">Paid in Full (Online)</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
               <span className="text-sm font-bold">Pay at Property</span>
             </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#f2e7d9] text-center print:mt-16">
          <p className="text-xs text-[#828282] font-medium">Thank you for booking with PrimeStay.</p>
          <p className="text-xs text-[#828282] font-medium mt-1">If you have any questions, please contact our support.</p>
        </div>
      </div>
      
      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-y { border-top: 1px solid #f2e7d9 !important; border-bottom: 1px solid #f2e7d9 !important; }
          .print\\:border-x-0 { border-left: none !important; border-right: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:mt-16 { margin-top: 4rem !important; }
        }
      `}} />
    </div>
  )
}
