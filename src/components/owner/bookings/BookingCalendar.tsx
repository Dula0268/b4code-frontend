"use client";

import { useOwnerBookingStore } from "@/store/owner/booking.store";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function BookingCalendar() {
  const { reservations, activeFilter, selectedPropertyId } = useOwnerBookingStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Map reservations to calendar events, applying filters
  const events = useMemo(() => {
    return reservations.filter(r => {
      // Filter by property
      if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
      
      if (activeFilter === 'UPCOMING') return r.status === 'PENDING' || r.status === 'CONFIRMED' || r.status === 'CHECKED_IN';
      if (activeFilter === 'COMPLETED') return r.status === 'COMPLETED';
      if (activeFilter === 'CANCELED') return r.status === 'CANCELED' || r.status === 'CANCELLED' || r.status === 'NO_SHOW';
      
      return true;
    }).map(res => ({
      id: res.id,
      title: `${res.guestName} (${res.roomType})`,
      start: new Date(res.checkIn),
      end: new Date(res.checkOut),
      resource: res,
    }));
  }, [reservations, activeFilter, selectedPropertyId]);

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = "#953002"; // brand primary
    if (status === "PENDING") backgroundColor = "#fbbf24";
    if (status === "CANCELED" || status === "CANCELLED" || status === "NO_SHOW") backgroundColor = "#ef4444";
    if (status === "CHECKED_IN") backgroundColor = "#10b981";

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      }
    };
  };

  return (
    <div className="h-[600px] w-full bg-white p-4 rounded-xl border shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors bg-white text-slate-700"
          >
            Today
          </button>
          <label className="text-sm font-semibold text-slate-600">Jump to:</label>
          <input 
            type="month" 
            value={format(currentDate, "yyyy-MM")}
            onChange={(e) => {
              if (e.target.value) {
                const [year, month] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1));
              }
            }}
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#953002]"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={setCurrentDate}
          style={{ height: "100%" }}
          eventPropGetter={eventStyleGetter}
          views={["month"]}
          toolbar={false}
          popup
        />
      </div>
    </div>
  );
}
