"use client";

import { useOwnerBookingStore } from "@/store/owner/booking.store";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
import ReservationDetailsSheet from "./ReservationDetailsSheet";

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
  const [selectedRes, setSelectedRes] = useState<string | null>(null);

  // Map reservations to calendar events, applying filters
  const events = useMemo(() => {
    return reservations.filter(r => {
      // Filter by property
      if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
      
      // Filter by Quick Filters
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'PENDING') return r.status === 'PENDING';
      if (activeFilter === 'CANCELED') return r.status === 'CANCELED' || r.status === 'NO_SHOW';
      
      const today = new Date().toISOString().split('T')[0];
      if (activeFilter === 'ARRIVING') return r.checkIn && r.checkIn.startsWith(today);
      if (activeFilter === 'DEPARTING') return r.checkOut && r.checkOut.startsWith(today);
      
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
    if (status === "CANCELED" || status === "NO_SHOW") backgroundColor = "#ef4444";
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
    <div className="h-[600px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => setSelectedRes(event.id)}
        views={["month", "week", "day"]}
        popup
      />
      <ReservationDetailsSheet 
        isOpen={!!selectedRes} 
        onClose={() => setSelectedRes(null)} 
        reservationId={selectedRes} 
      />
    </div>
  );
}
