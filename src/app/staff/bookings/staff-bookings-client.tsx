"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth/auth.store";
import { useStaffBookingsStore } from "@/store/staff/bookings/staff-bookings.store";
import type { OwnerReservationDto } from "@/api/staff/staff.api";
import { roomsApi, type AvailableRoomDto } from "@/api/rooms/rooms.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarCheck, CheckCircle2, LogOut, Clock, BedDouble, DoorOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StaffHeader from "@/components/staff/layout/staff-header";

import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

type TabKey = "upcoming" | "inhouse" | "completed" | "noshows";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "inhouse", label: "In-House" },
  { key: "completed", label: "Completed" },
  { key: "noshows", label: "No Shows" },
];

function BookingCard({ booking, actionButton }: { booking: OwnerReservationDto; actionButton?: React.ReactNode }) {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border border-white py-0 gap-0 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.08)] hover:-translate-y-1 transition-all duration-500 rounded-2xl flex flex-col group relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C05621] opacity-[0.03] blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      
      {/* Card Header */}
      <div className="bg-white/40 border-b border-[#F0EBE7]/50 px-5 py-4 flex items-center justify-between z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#1A1A1A]">{booking.confirmationCode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9E7B6A]">
            <Clock size={12} />
            <span>{format(new Date(booking.checkIn), "MMM dd")}</span>
            <span>-</span>
            <span>{format(new Date(booking.checkOut), "MMM dd")}</span>
          </div>
        </div>
        <span className="bg-[#FFF8F0] text-[#C05621] text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
          {booking.status}
        </span>
      </div>

      {/* Card Body */}
      <CardContent className="px-5 py-4 flex flex-col gap-3 flex-1 z-10">
        <div className="flex items-center justify-between bg-white/50 p-2.5 rounded-xl border border-white shadow-sm">
          <div className="flex items-center gap-2">
            <BedDouble size={16} className="text-[#9E7B6A]" />
            <span className="text-xs font-bold text-[#1A1A1A]">
              {booking.roomName}
              {booking.roomNumber && <span className="text-[#C05621]"> · Room {booking.roomNumber}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C05621]">
            <User size={14} />
            <span>{booking.guestName}</span>
          </div>
        </div>
        
        <p className="text-xs text-[#9E7B6A]">{booking.guestEmail}</p>

        {actionButton && (
          <div className="pt-2 flex flex-col">
            {actionButton}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ size?: number; className?: string }>; message: string }) {
  return (
    <div className="text-center py-12 bg-white/70 rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#9E7B6A]">
      <Icon size={40} className="mx-auto text-[#C05621] opacity-40 mb-3" />
      <p className="text-sm font-bold text-[#1A1A1A]">{message}</p>
    </div>
  );
}

export default function StaffBookingsClient() {
  const { user } = useAuthStore();
  const reservations = useStaffBookingsStore((s) => s.reservations);
  const loading = useStaffBookingsStore((s) => s.loading);
  const fetchReservations = useStaffBookingsStore((s) => s.fetchReservations);
  const checkIn = useStaffBookingsStore((s) => s.checkIn);
  const checkOut = useStaffBookingsStore((s) => s.checkOut);
  const takePayment = useStaffBookingsStore((s) => s.takePayment);
  const resetUnreadCount = useStaffBookingsStore((s) => s.resetUnreadCount);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<number | null>(null);
  const [nicNumber, setNicNumber] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInBookingId, setCheckInBookingId] = useState<number | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState("");
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomDto[]>([]);
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState(false);
  const [availableRoomsError, setAvailableRoomsError] = useState(false);

  // Fetch once on mount. Live updates arrive via the store's SSE connection
  // (set up globally by BookingsSseLoader), which refetches quietly in the
  // background — so this page never needs its own polling/refresh loop.
  useEffect(() => {
    if (!user?.propertyId) return;
    fetchReservations(user.propertyId).finally(() => setHasLoadedOnce(true));
  }, [user?.propertyId, fetchReservations]);

  // Viewing the page clears the "new booking" badge in the sidebar.
  useEffect(() => {
    resetUnreadCount();
  }, [resetUnreadCount]);

  // Only the very first load blocks the page behind a skeleton — background
  // refreshes (from SSE events) update the list quietly instead of flashing
  // the whole page back to a loading state.
  const isInitialLoading = !hasLoadedOnce && loading;

  const openCheckInModal = (id: number) => {
    setCheckInBookingId(id);
    setRoomNumberInput("");
    setAvailableRooms([]);
    setAvailableRoomsError(false);
    setCheckInModalOpen(true);

    const booking = reservations.find((r) => r.id === id);
    if (!booking?.roomId) {
      setAvailableRoomsError(true);
      return;
    }
    setLoadingAvailableRooms(true);
    roomsApi
      .getAvailableRooms(booking.roomId)
      .then((rooms) => setAvailableRooms(rooms))
      .catch(() => setAvailableRoomsError(true))
      .finally(() => setLoadingAvailableRooms(false));
  };

  const handleCheckInSubmit = async () => {
    if (!user?.propertyId || !checkInBookingId || !roomNumberInput.trim()) {
      toast.error("Please enter the room number you're assigning this guest");
      return;
    }
    try {
      setProcessingCheckIn(true);
      await checkIn(user.propertyId, checkInBookingId, roomNumberInput.trim());
      toast.success(`Guest checked in to Room ${roomNumberInput.trim()}`);
      setCheckInModalOpen(false);
      setCheckInBookingId(null);
      setRoomNumberInput("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check in");
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    if (!user?.propertyId) return;
    try {
      await checkOut(user.propertyId, id);
      toast.success("Guest successfully checked out");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check out");
    }
  };

  const handleTakePaymentSubmit = async () => {
    if (!user?.propertyId || !paymentBookingId || !nicNumber) {
      toast.error("Please enter guest passkey");
      return;
    }
    try {
      setProcessingPayment(true);
      await takePayment(user.propertyId, paymentBookingId, nicNumber);
      toast.success("Payment successful");
      setPaymentModalOpen(false);
      setPaymentBookingId(null);
      setNicNumber("");
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

  // Search is filtered client-side over the already-fetched list — no
  // per-keystroke network round trip, matching the orders queue pattern.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter(
      (r) =>
        r.guestName?.toLowerCase().includes(q) ||
        r.confirmationCode?.toLowerCase().includes(q) ||
        r.roomName?.toLowerCase().includes(q)
    );
  }, [reservations, search]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingAll = useMemo(() => searched.filter((r) => r.status === "CONFIRMED"), [searched]);
  const noShows = useMemo(
    () =>
      upcomingAll.filter((r) => {
        const checkInDate = new Date(r.checkIn);
        checkInDate.setHours(0, 0, 0, 0);
        return r.paymentMethod === "PAY_AT_PROPERTY" && checkInDate < today && !r.isPaid;
      }),
    [upcomingAll, today]
  );
  const upcoming = useMemo(() => upcomingAll.filter((r) => !noShows.includes(r)), [upcomingAll, noShows]);
  const inHouse = useMemo(() => searched.filter((r) => r.status === "CHECKED_IN"), [searched]);
  const completed = useMemo(() => searched.filter((r) => r.status === "COMPLETED"), [searched]);

  const counts: Record<TabKey, number> = {
    upcoming: upcoming.length,
    inhouse: inHouse.length,
    completed: completed.length,
    noshows: noShows.length,
  };

  return (
    <>
      <StaffHeader
        title="Bookings"
        subtitle="Manage guest check-ins and check-outs"
        searchPlaceholder="Search by guest or booking ref..."
        onSearch={setSearch}
      />

      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <div className="px-4 lg:px-6 py-4 lg:py-6 pt-[80px] lg:pt-[88px] max-w-6xl mx-auto w-full flex flex-col gap-5">

          <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8] w-full overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const isNoShows = tab.key === "noshows";
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    isActive
                      ? isNoShows
                        ? "bg-white text-[#EB5757] shadow-sm"
                        : "bg-white text-[#1A1A1A] shadow-sm"
                      : isNoShows
                      ? "text-[#EB5757]/70 hover:text-[#EB5757]"
                      : "text-[#9E7B6A] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab.label}
                  {counts[tab.key] > 0 && (
                    <span
                      className={`text-[10px] font-bold rounded-full px-1.5 py-0 ${
                        isActive
                          ? isNoShows
                            ? "bg-[#EB5757] text-white"
                            : "bg-[#C05621] text-white"
                          : "bg-[#E8E8E8] text-[#6B7280]"
                      }`}
                    >
                      {counts[tab.key]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isInitialLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[104px] bg-white rounded-2xl border border-[#E8EAED]" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeTab === "upcoming" &&
                (upcoming.length === 0 ? (
                  <EmptyState icon={Clock} message="No upcoming bookings found" />
                ) : (
                  upcoming.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionButton={
                        booking.paymentMethod === "PAY_AT_PROPERTY" && !booking.isPaid ? (
                          <Button onClick={() => openPaymentModal(booking.id)} className="bg-[#EB5757] hover:bg-[#D94F4F] text-white">
                            Confirm Payment
                          </Button>
                        ) : (
                          <Button onClick={() => openCheckInModal(booking.id)} className="bg-[#1A1A1A] hover:bg-[#C05621] text-white">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                        )
                      }
                    />
                  ))
                ))}

              {activeTab === "inhouse" &&
                (inHouse.length === 0 ? (
                  <EmptyState icon={CalendarCheck} message="No guests currently in-house" />
                ) : (
                  inHouse.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionButton={
                        <Button
                          onClick={() => handleCheckOut(booking.id)}
                          variant="outline"
                          className="border-[#EB5757]/30 text-[#EB5757] hover:bg-[#FFF6F6] hover:border-[#EB5757]/50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Check Out
                        </Button>
                      }
                    />
                  ))
                ))}

              {activeTab === "completed" &&
                (completed.length === 0 ? (
                  <EmptyState icon={CheckCircle2} message="No completed bookings found" />
                ) : (
                  completed.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                ))}

              {activeTab === "noshows" &&
                (noShows.length === 0 ? (
                  <EmptyState icon={Clock} message="No missed bookings found" />
                ) : (
                  noShows.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionButton={
                        <div className="text-[#EB5757] text-xs font-bold px-3 py-1.5 bg-[#FFF6F6] rounded-lg">
                          Missed Check-in
                        </div>
                      }
                    />
                  ))
                ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-white rounded-2xl">
          {(() => {
            const paymentBooking = reservations.find((r) => r.id === paymentBookingId);
            const isPasskeyMatched = paymentBooking?.nicNumber ? nicNumber.trim() === paymentBooking.nicNumber : nicNumber.trim().length > 0;

            return (
              <>
                <DialogHeader>
                  <DialogTitle>Confirm Payment</DialogTitle>
                  <DialogDescription>
                    Verify the guest&apos;s secret passkey to view payment details and complete the transaction.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="nic">Guest Passkey <span className="text-[#EB5757]">*</span></Label>
                  <Input
                    id="nic"
                    placeholder="Enter passkey to verify..."
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    className={`mt-2 ${nicNumber && !isPasskeyMatched ? "border-[#EB5757]" : ""}`}
                  />
                  {nicNumber && !isPasskeyMatched && (
                    <p className="text-[#EB5757] text-xs mt-1">Passkey does not match.</p>
                  )}

                  {isPasskeyMatched && paymentBooking && (
                    <div className="mt-6 p-4 bg-[#FAFBFC] border border-[#F0EBE7] rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-[#1A1A1A] mb-2">Payment Details</h4>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#9E7B6A]">Booking Ref:</span>
                        <span className="font-medium text-[#1A1A1A]">{paymentBooking.confirmationCode}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3 border-b border-[#F0EBE7] pb-3">
                        <span className="text-[#9E7B6A]">Guest:</span>
                        <span className="font-medium text-[#1A1A1A]">{paymentBooking.guestName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1A1A1A]">Amount to Collect:</span>
                        <span className="text-lg font-black text-[#C05621]">
                          LKR {Number(paymentBooking.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentModalOpen(false)} disabled={processingPayment}>Cancel</Button>
                  <Button onClick={handleTakePaymentSubmit} className="bg-[#C05621] hover:bg-[#A04518] text-white" disabled={processingPayment || !isPasskeyMatched}>
                    {processingPayment ? "Processing..." : "Complete Payment"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
        <DialogContent className="bg-white rounded-2xl">
          {(() => {
            const booking = reservations.find((r) => r.id === checkInBookingId);
            const hasNoRoomsConfigured = !loadingAvailableRooms && (availableRoomsError || availableRooms.length === 0);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Assign Room &amp; Check In</DialogTitle>
                  <DialogDescription>
                    {booking
                      ? `${booking.guestName} booked a ${booking.roomName}. Select the room you're assigning them.`
                      : "Select the room you're assigning this guest."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-3">
                  <Label htmlFor="room-number">Room Number <span className="text-[#EB5757]">*</span></Label>

                  {loadingAvailableRooms ? (
                    <div className="mt-2 h-10 rounded-xl bg-[#F5F6F8] animate-pulse" />
                  ) : hasNoRoomsConfigured ? (
                    <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-[#F0C36D]/50 bg-[#FFF8E8] px-3.5 py-3">
                      <AlertTriangle size={16} className="text-[#C08A1E] shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-[#8A6416] leading-relaxed">
                        No rooms configured for {booking?.roomName ?? "this room type"} yet. Add door numbers under
                        Room Management first, then come back to check this guest in.
                      </p>
                    </div>
                  ) : (
                    <Select value={roomNumberInput} onValueChange={setRoomNumberInput}>
                      <SelectTrigger className="w-full h-10 mt-2 rounded-xl bg-white border-[#F0EBE7] focus:ring-[#C05621]/30">
                        <div className="flex items-center gap-2">
                          <DoorOpen size={14} className="text-[#9E7B6A]" />
                          <SelectValue placeholder="Select an available room" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[#F0EBE7] shadow-xl">
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.doorNumber}>
                            Room {room.doorNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckInModalOpen(false)} disabled={processingCheckIn}>Cancel</Button>
                  <Button
                    onClick={handleCheckInSubmit}
                    className="bg-[#1A1A1A] hover:bg-[#C05621] text-white"
                    disabled={processingCheckIn || !roomNumberInput.trim() || hasNoRoomsConfigured}
                  >
                    {processingCheckIn ? "Checking in..." : "Confirm Check In"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
