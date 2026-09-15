"use client";

import { useState, useMemo } from "react";
import { useOwnerBookingStore } from "@/store/owner/booking.store";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingCalendar() {
  const { reservations, activeFilter, selectedPropertyId } = useOwnerBookingStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayModal, setSelectedDayModal] = useState<{ date: string, bookings: any[], dateObj: Date } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const setToday = () => setCurrentDate(new Date());

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      // Filter by property
      if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
      
      if (activeFilter === 'UPCOMING') return r.status === 'PENDING' || r.status === 'CONFIRMED';
      if (activeFilter === 'CHECKED_IN') return r.status === 'CHECKED_IN';
      if (activeFilter === 'COMPLETED') return r.status === 'COMPLETED';
      if (activeFilter === 'CANCELED') return r.status === 'CANCELED' || r.status === 'CANCELLED' || r.status === 'NO_SHOW';
      
      return true;
    });
  }, [reservations, activeFilter, selectedPropertyId]);

  // Calendar logic
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  const getBookingStyle = (status: string) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CHECKED_IN":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELED":
      case "CANCELLED":
      case "NO_SHOW":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Pending";
      case "CANCELED":
      case "CANCELLED": return "Canceled";
      case "NO_SHOW": return "No Show";
      case "CHECKED_IN": return "Checked In";
      case "COMPLETED": return "Completed";
      case "CONFIRMED": return "Confirmed";
      default: return status;
    }
  };

  // Map bookings to dates they span
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    
    filteredReservations.forEach(res => {
      const ci = new Date(res.checkIn);
      const co = new Date(res.checkOut);
      
      // Normalize to midnight
      const start = new Date(ci.getFullYear(), ci.getMonth(), ci.getDate());
      const end = new Date(co.getFullYear(), co.getMonth(), co.getDate());
      
      // Add this reservation to every date it spans (stay nights)
      let current = new Date(start);
      if (start.getTime() === end.getTime()) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(res);
      } else {
        while (current < end) {
          const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
          if (!map.has(dateStr)) map.set(dateStr, []);
          map.get(dateStr)!.push(res);
          current.setDate(current.getDate() + 1);
        }
      }
    });
    
    return map;
  }, [filteredReservations]);

  return (
    <div className="bg-white rounded-3xl border border-[#E8EAED] shadow-sm p-6 flex flex-col gap-6">
      {/* Calendar Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-[#F9FAFB]">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 rounded-xl text-gray-700 hover:bg-white hover:shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold text-sm text-[#1A1A1A] px-3 min-w-[140px] text-center select-none">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 rounded-xl text-gray-700 hover:bg-white hover:shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={setToday}
            className="rounded-xl text-xs h-9 border-gray-200 hover:border-[#953002] hover:text-[#953002]"
          >
            Today
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[11px] md:text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>Upcoming</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>Checked In</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>Completed</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></div>Canceled / No Show</div>
        </div>
      </div>



      {/* Monthly Grid */}
      <div className="select-none">
        {/* Day Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <span
              key={d}
              className="text-xs font-bold text-gray-400 uppercase tracking-wider py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month Blank Days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const prevDayNum = prevMonthDays - firstDayOfMonth + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[120px] p-2.5 rounded-2xl border border-gray-100/60 bg-gray-50/40 opacity-40 flex flex-col"
              >
                <span className="text-xs font-semibold text-gray-400">
                  {prevDayNum}
                </span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(
              2,
              "0"
            )}-${String(dayNum).padStart(2, "0")}`;

            const dayBookings = bookingsByDate.get(dateStr) || [];
            
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth - 1, dayNum).toDateString();

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (dayBookings.length > 0) {
                    setSelectedDayModal({ date: dateStr, bookings: dayBookings, dateObj: new Date(currentYear, currentMonth - 1, dayNum) });
                  }
                }}
                className={`min-h-[120px] p-2.5 rounded-2xl border transition-all bg-white flex flex-col gap-1.5 ${dayBookings.length > 0 ? 'cursor-pointer hover:border-slate-300 hover:shadow-md hover:bg-slate-50' : 'hover:bg-gray-50/80 border-gray-200'}`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-white bg-[#953002] w-6 h-6 flex items-center justify-center rounded-full" : "text-[#1A1A1A]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayBookings.length > 0 && (
                     <span className="text-[10px] font-semibold text-gray-400">
                       {dayBookings.length}
                     </span>
                  )}
                </div>

                {/* Bookings List */}
                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden pointer-events-none">
                  {dayBookings.slice(0, 3).map((b, idx) => (
                    <div 
                      key={`${b.id}-${idx}`} 
                      className={`shrink-0 text-[10px] px-2 py-1 rounded-md border font-semibold truncate transition-opacity ${getBookingStyle(b.status)}`}
                    >
                      {b.guestName}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] font-bold text-slate-400 mt-auto pt-0.5 text-center">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      <Dialog open={!!selectedDayModal} onOpenChange={(open) => !open && setSelectedDayModal(null)}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl" aria-describedby={undefined}>
          {selectedDayModal && (
            <>
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <DialogHeader className="p-0 m-0 text-left">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                      {format(selectedDayModal.dateObj, "MMMM d, yyyy")}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedDayModal.bookings.length} {selectedDayModal.bookings.length === 1 ? 'reservation' : 'reservations'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm border border-slate-100">
                  {format(selectedDayModal.dateObj, "d")}
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto flex flex-col gap-3">
                {selectedDayModal.bookings.map((b, idx) => (
                  <div key={`${b.id}-${idx}`} className={`p-3 rounded-xl border flex flex-col gap-1.5 ${getBookingStyle(b.status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate pr-2">{b.guestName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 shrink-0">{getStatusLabel(b.status)}</span>
                    </div>
                    <div className="text-xs opacity-90 font-medium flex items-center justify-between">
                       <span>{b.roomType}</span>
                       <span className="font-mono text-[10px] uppercase opacity-70">Booking ID: {b.confirmationCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
