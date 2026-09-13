"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerBookingStore, FilterType } from "@/store/owner/booking.store";
import ReservationsTable from "@/components/owner/bookings/ReservationsTable";
import BookingCalendar from "@/components/owner/bookings/BookingCalendar";
import { List, Calendar as CalendarIcon, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function BookingsPage() {
  const { connect, disconnect, fetchReservations, isLoading, properties, selectedPropertyId, setSelectedPropertyId, activeFilter, setActiveFilter, reservations } = useOwnerBookingStore();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    fetchReservations();
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchReservations]);

  const activeReservationsCount = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;

  const handleExportCSV = () => {
    if (reservations.length === 0) return;

    const headers = ['ID', 'Guest Name', 'Check-in', 'Check-out', 'Room Type', 'Property', 'Status', 'Payout'];
    const csvContent = [
      headers.join(','),
      ...reservations.map(r => [
        r.id,
        `"${r.guestName}"`,
        r.checkIn,
        r.checkOut,
        `"${r.roomType}"`,
        `"${r.propertyName}"`,
        r.status,
        r.payout
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings & Reservations</h1>
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

          <Button variant="outline" className="bg-white hidden sm:flex" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
        <Filter className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
        <Badge 
          variant={activeFilter === 'ALL' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'ALL' ? 'bg-[#953002]' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Bookings
        </Badge>
        <Badge 
          variant={activeFilter === 'ARRIVING' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'ARRIVING' ? 'bg-blue-600' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('ARRIVING')}
        >
          Arriving Today
        </Badge>
        <Badge 
          variant={activeFilter === 'DEPARTING' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'DEPARTING' ? 'bg-orange-500' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('DEPARTING')}
        >
          Departing Today
        </Badge>
        <Badge 
          variant={activeFilter === 'PENDING' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('PENDING')}
        >
          Pending Confirmation
        </Badge>
        <Badge 
          variant={activeFilter === 'CANCELED' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'CANCELED' ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('CANCELED')}
        >
          Canceled / No-Show
        </Badge>
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
