"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerBookingStore, FilterType } from "@/store/owner/booking.store";
import ReservationsTable from "@/components/owner/bookings/ReservationsTable";
import BookingCalendar from "@/components/owner/bookings/BookingCalendar";
import { List, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OwnerHeader from "@/components/owner/layout/owner-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
  const { connect, disconnect, fetchReservations, isLoading, properties, selectedPropertyId, setSelectedPropertyId, activeFilter, reservations } = useOwnerBookingStore();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    fetchReservations();
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchReservations]);

  const activeReservationsCount = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;

  return (
    <>
      <OwnerHeader
        title="Bookings"
        subtitle="View and manage all your property reservations"
      />
      <main className="mt-[64px] p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings &amp; Reservations</h1>
            <p className="text-slate-500 mt-1">Manage your property reservations, view schedules, and modify bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select 
              value={selectedPropertyId.toString()} 
              onValueChange={(val) => setSelectedPropertyId(val === 'ALL' ? 'ALL' : parseInt(val, 10))}
            >
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Properties</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            
            <div className="text-sm text-slate-500 hidden sm:block">
              Showing <span className="font-semibold text-slate-900">{activeReservationsCount}</span> active reservations
            </div>
          </div>

          <TabsContent value="list" className="m-0 border-none p-0 outline-none">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <ReservationsTable />
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="m-0 border-none p-0 outline-none">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full rounded-xl" />
            ) : (
              <BookingCalendar />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
