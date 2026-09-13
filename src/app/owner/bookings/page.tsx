"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerBookingStore } from "@/store/owner/booking.store";
import ReservationsTable from "@/components/owner/bookings/ReservationsTable";
import BookingCalendar from "@/components/owner/bookings/BookingCalendar";
import { List, Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const { connect, disconnect, fetchReservations, isLoading } = useOwnerBookingStore();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    fetchReservations();
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchReservations]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings & Reservations</h1>
          <p className="text-slate-500 mt-1">Manage your property reservations, view schedules, and modify bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-200/50 p-1">
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="m-0 border-none p-0 outline-none">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">Loading reservations...</div>
          ) : (
            <ReservationsTable />
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="m-0 border-none p-0 outline-none">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">Loading calendar...</div>
          ) : (
            <BookingCalendar />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
