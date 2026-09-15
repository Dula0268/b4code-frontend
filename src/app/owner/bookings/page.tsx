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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ownerReservationApi } from "@/api/owner/owner-reservation.api";

export default function BookingsPage() {
  const { connect, disconnect, fetchReservations, isLoading, properties, selectedPropertyId, setSelectedPropertyId, activeFilter, setActiveFilter, reservations } = useOwnerBookingStore();
  const [activeTab, setActiveTab] = useState("list");
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    fetchReservations();
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchReservations]);

  const activeReservationsCount = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;

  const handleExportPDF = async () => {
    if (reservations.length === 0) return;
    
    setIsExportingPdf(true);

    try {
      // Use activeFilter if it's not 'ALL'
      const statusParam = activeFilter !== 'ALL' ? activeFilter : undefined;
      const searchParam = undefined; // assuming no search bar implemented here yet
      
      const blob = await ownerReservationApi.exportReservationsPdf(searchParam, statusParam);
      // Create a Blob URL with correct type so the browser knows to render it as PDF
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      
      setPdfPreviewUrl(url);
      setIsPdfPreviewOpen(true);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
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

          <Button variant="outline" className="bg-white hidden sm:flex" onClick={handleExportPDF} disabled={isExportingPdf}>
            <Download className="mr-2 h-4 w-4" />
            {isExportingPdf ? "Loading..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
        <Filter className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
        <Badge 
          variant={activeFilter === 'UPCOMING' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'UPCOMING' ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('UPCOMING')}
        >
          Upcoming
        </Badge>
        <Badge 
          variant={activeFilter === 'COMPLETED' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('COMPLETED')}
        >
          Completed
        </Badge>
        <Badge 
          variant={activeFilter === 'CANCELED' ? 'default' : 'outline'} 
          className={`cursor-pointer shrink-0 ${activeFilter === 'CANCELED' ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          onClick={() => setActiveFilter('CANCELED')}
        >
          Canceled
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

      <Dialog open={isPdfPreviewOpen} onOpenChange={(open) => {
        if (!open && pdfPreviewUrl) {
          window.URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }
        setIsPdfPreviewOpen(open);
      }}>
        <DialogContent className="!max-w-full !w-full !h-full border-none p-6 flex flex-col bg-white shadow-none top-0 left-0 translate-x-0 translate-y-0 m-0 !rounded-none duration-200">
          <DialogHeader>
            <DialogTitle className="text-2xl">PDF Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
            {pdfPreviewUrl ? (
              <iframe 
                src={pdfPreviewUrl} 
                className="w-full h-full border-none bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="text-slate-500">Loading preview...</div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="lg" onClick={() => setIsPdfPreviewOpen(false)}>Cancel</Button>
            <Button size="lg" onClick={() => {
              if (pdfPreviewUrl) {
                const a = document.createElement('a');
                a.href = pdfPreviewUrl;
                a.download = `Reservations-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setIsPdfPreviewOpen(false);
              }
            }}>
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
