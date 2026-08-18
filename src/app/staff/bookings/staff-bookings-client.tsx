"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth/auth.store";
import { staffApi, OwnerReservationDto } from "@/api/staff/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarCheck, CheckCircle2, LogOut, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function StaffBookingsClient() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<OwnerReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<number | null>(null);
  const [nicNumber, setNicNumber] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.propertyId) return;
      try {
        setLoading(true);
        const data = await staffApi.getReservations(user.propertyId, search || undefined);
        setReservations(data);
      } catch (error: any) {
        // Extract message to avoid Next.js dev overlay from catching raw Error objects
        const errMsg = error?.response?.data?.message || error?.message || "Unknown error";
        console.error("Failed to fetch reservations:", errMsg);
        toast.error("Failed to load bookings: " + errMsg);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchReservations();
    }, 500); // debounce search

    return () => clearTimeout(timer);
  }, [user?.propertyId, search, refreshTrigger]);

  const handleCheckIn = async (id: number) => {
    if (!user?.propertyId) return;
    try {
      await staffApi.checkInReservation(user.propertyId, id);
      toast.success("Guest checked in successfully");
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async (id: number) => {
    if (!user?.propertyId) return;
    try {
      await staffApi.checkOutReservation(user.propertyId, id);
      toast.success("Guest checked out successfully");
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check out");
    }
  };

  const handleTakePaymentSubmit = async () => {
    if (!user?.propertyId || !paymentBookingId || !nicNumber) {
      toast.error("Please enter guest NIC number");
      return;
    }
    
    try {
      setProcessingPayment(true);
      await staffApi.takePayment(user.propertyId, paymentBookingId, nicNumber);
      toast.success("Payment collected successfully");
      setPaymentModalOpen(false);
      setPaymentBookingId(null);
      setNicNumber("");
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const openPaymentModal = (id: number) => {
    setPaymentBookingId(id);
    setNicNumber("");
    setPaymentModalOpen(true);
  };

  const upcoming = reservations.filter(r => r.status === "CONFIRMED");
  const inHouse = reservations.filter(r => r.status === "CHECKED_IN");
  const completed = reservations.filter(r => r.status === "COMPLETED");

  const BookingCard = ({ booking, actionButton }: { booking: OwnerReservationDto, actionButton?: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
              {booking.confirmationCode}
            </span>
            <span className="text-sm text-gray-500 font-medium">{booking.roomName}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{booking.guestName}</h3>
          <p className="text-sm text-gray-500">{booking.guestEmail}</p>
        </div>
        
        <div className="flex flex-col md:items-end gap-1 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold text-gray-900">In:</span>
            {format(new Date(booking.checkIn), "MMM dd, yyyy")}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold text-gray-900">Out:</span>
            {format(new Date(booking.checkOut), "MMM dd, yyyy")}
          </div>
        </div>
        
        {actionButton && (
          <div className="mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex items-center justify-end">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500">Manage check-ins and check-outs</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search guest or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-white border p-1 rounded-xl w-full flex overflow-x-auto">
            <TabsTrigger value="upcoming" className="flex-1 rounded-lg data-[state=active]:bg-[#C05621] data-[state=active]:text-white">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="inhouse" className="flex-1 rounded-lg data-[state=active]:bg-[#C05621] data-[state=active]:text-white">
              In-House ({inHouse.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-lg data-[state=active]:bg-[#C05621] data-[state=active]:text-white">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C05621]"></div>
              </div>
            ) : (
              <>
                <TabsContent value="upcoming" className="mt-0 flex flex-col gap-4 focus-visible:outline-none">
                  {upcoming.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No upcoming bookings found</p>
                    </div>
                  ) : (
                    upcoming.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        actionButton={
                          booking.paymentMethod === 'PAY_AT_PROPERTY' && !booking.isPaid ? (
                            <Button onClick={() => openPaymentModal(booking.id)} className="bg-red-600 hover:bg-red-700 text-white">
                              Take Payment
                            </Button>
                          ) : (
                            <Button onClick={() => handleCheckIn(booking.id)} className="bg-[#1A1A1A] hover:bg-[#C05621] text-white">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                          )
                        } 
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="inhouse" className="mt-0 flex flex-col gap-4 focus-visible:outline-none">
                  {inHouse.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                      <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No guests currently in-house</p>
                    </div>
                  ) : (
                    inHouse.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        actionButton={
                          <Button onClick={() => handleCheckOut(booking.id)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700">
                            <LogOut className="w-4 h-4 mr-2" />
                            Check Out
                          </Button>
                        } 
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0 flex flex-col gap-4 focus-visible:outline-none">
                  {completed.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No completed bookings found</p>
                    </div>
                  ) : (
                    completed.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Physical Payment</DialogTitle>
            <DialogDescription>
              Verify the guest's NIC and collect physical payment for the booking before checking them in.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="nic">Guest NIC Number <span className="text-red-500">*</span></Label>
            <Input 
              id="nic"
              placeholder="e.g. 199012345678" 
              value={nicNumber}
              onChange={(e) => setNicNumber(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)} disabled={processingPayment}>Cancel</Button>
            <Button onClick={handleTakePaymentSubmit} className="bg-[#C05621] hover:bg-[#A04518] text-white" disabled={processingPayment || !nicNumber}>
              {processingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
