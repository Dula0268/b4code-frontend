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

type TabKey = "upcoming" | "completed" | "canceled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];

function BookingCard({ booking, actionButton, activeTab }: { booking: OwnerReservationDto; actionButton?: React.ReactNode; activeTab: TabKey }) {
  const isCheckInToday = booking.checkIn ? format(new Date(booking.checkIn), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false;

  return (
    <div className={`bg-white/80 backdrop-blur-xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-500 rounded-2xl p-4 sm:px-6 flex flex-col md:flex-row md:items-center gap-4 group relative overflow-hidden ${isCheckInToday && activeTab === 'upcoming' ? 'border-blue-200 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]' : 'border-white hover:shadow-[0_8px_30px_rgb(192,86,33,0.08)]'}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C05621] opacity-[0.03] blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      
      {/* Col 1: Guest & Reference */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[220px] z-10 shrink-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#1A1A1A]">
            <User size={14} className="text-[#C05621]" />
            <span className="truncate">{booking.guestName}</span>
            {isCheckInToday && activeTab === 'upcoming' && (
              <span className="ml-1 text-[9px] uppercase tracking-wider font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full shadow-sm">
                Arriving Today
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#9E7B6A] ml-[20px] truncate">{booking.guestEmail}</span>
        </div>
        <div className="flex items-center gap-2 ml-[20px] mt-0.5">
          <span className="text-[10px] font-bold text-[#C05621] bg-[#FFF8F0] px-2 py-0.5 rounded-md border border-[#F0EBE7]">Ref: {booking.confirmationCode}</span>
        </div>
      </div>

      {/* Col 2: Room Details */}
      <div className="flex-1 flex flex-col justify-center z-10 bg-white/50 p-3 rounded-xl border border-white shadow-sm sm:bg-transparent sm:border-none sm:shadow-none sm:p-0">
        <div className="flex items-start gap-2">
          <BedDouble size={16} className="text-[#9E7B6A] mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1A1A1A] truncate">{booking.roomName}</span>
            {booking.roomNumber ? (
              <span className="text-[11px] text-[#C05621] font-semibold mt-0.5">Room {booking.roomNumber}</span>
            ) : (
              <span className="text-[10px] text-[#9E7B6A] font-medium mt-0.5 italic">Not Assigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row items-center gap-3 z-10 shrink-0 md:justify-end mt-2 md:mt-0 min-w-[180px]">
        {!actionButton && (
          <div className="flex flex-col items-end mr-1">
            {activeTab === "completed" && (
              <>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7B6A]">Completed On</span>
                <span className="text-xs font-bold text-[#1A1A1A]">{format(new Date(booking.checkOut), "MMM dd, yyyy")}</span>
              </>
            )}
            {activeTab === "canceled" && (
              <>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7B6A]">Canceled On</span>
                <span className="text-xs font-bold text-[#1A1A1A]">{format(new Date(booking.createdAt || booking.checkIn), "MMM dd, yyyy")}</span>
              </>
            )}
            {activeTab === "upcoming" && (
              <>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7B6A]">Start Date</span>
                <span className="text-xs font-bold text-[#1A1A1A]">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</span>
              </>
            )}
          </div>
        )}
        
        {actionButton && (
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7B6A]">Start Date</span>
              <span className="text-xs font-bold text-[#1A1A1A]">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex-shrink-0">
              {actionButton}
            </div>
          </div>
        )}
      </div>
    </div>
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

function ListHeader() {
  return (
    <div className="hidden md:flex items-center gap-4 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-[#9E7B6A] border-b border-[#E8E8E8]/70 mx-2 mb-1">
      <div className="flex-1 min-w-[220px] shrink-0">Guest & Booking Ref</div>
      <div className="flex-1 shrink-0">Room Assignment</div>
      <div className="shrink-0 flex items-center justify-end min-w-[180px]">
        Action
      </div>
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
  const [roomNumberInputs, setRoomNumberInputs] = useState<string[]>([]);
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
    const booking = reservations.find((r) => r.id === id);
    const quantity = booking?.roomQuantity || 1;
    setRoomNumberInputs(Array(quantity).fill(""));
    setAvailableRooms([]);
    setAvailableRoomsError(false);
    setCheckInModalOpen(true);

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
    if (!user?.propertyId || !checkInBookingId) return;
    
    // Check if any required room is not assigned
    if (roomNumberInputs.some(r => !r.trim())) {
      toast.error("Please select a room number for all requested rooms");
      return;
    }

    // Check for duplicate assignments in the same transaction
    const uniqueSelections = new Set(roomNumberInputs.filter(Boolean));
    if (uniqueSelections.size !== roomNumberInputs.length) {
      toast.error("You cannot assign the same room number multiple times");
      return;
    }

    const finalRooms = roomNumberInputs.map(r => r.trim()).join(",");

    try {
      setProcessingCheckIn(true);
      await checkIn(user.propertyId, checkInBookingId, finalRooms);
      toast.success(`Guest checked in to Room(s): ${finalRooms}`);
      setCheckInModalOpen(false);
      setCheckInBookingId(null);
      setRoomNumberInputs([]);
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

  const todayStr = useMemo(() => {
    return format(new Date(), "yyyy-MM-dd");
  }, []);

  const upcoming = useMemo(() => searched.filter((r) => {
    const isUpcomingStatus = r.status === "CONFIRMED" || r.status === "PENDING" || r.status === "CHECKED_IN";
    return isUpcomingStatus && (r.checkOut && r.checkOut >= todayStr);
  }), [searched, todayStr]);
  const completed = useMemo(() => searched.filter((r) => r.status === "COMPLETED"), [searched]);
  const canceled = useMemo(() => searched.filter((r) => r.status === "CANCELLED"), [searched]);

  const counts: Record<TabKey, number> = {
    upcoming: upcoming.length,
    completed: completed.length,
    canceled: canceled.length,
  };

  return (
    <>
      <StaffHeader
        title="Bookings"
        subtitle="Manage guest check-ins and check-outs"
        searchPlaceholder="Search by guest or booking ref..."
        onSearch={setSearch}
      />

      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="px-4 lg:px-6 py-4 lg:py-6 pt-[80px] lg:pt-[88px] max-w-6xl mx-auto w-full flex flex-col gap-5">

          <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8] w-full overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const isCanceled = tab.key === "canceled";
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    isActive
                      ? isCanceled
                        ? "bg-white text-[#EB5757] shadow-sm"
                        : "bg-white text-[#1A1A1A] shadow-sm"
                      : isCanceled
                      ? "text-[#EB5757]/70 hover:text-[#EB5757]"
                      : "text-[#9E7B6A] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab.label}
                  {counts[tab.key] > 0 && (
                    <span
                      className={`text-[10px] font-bold rounded-full px-1.5 py-0 ${
                        isActive
                          ? isCanceled
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
                  <>
                    <ListHeader />
                    {upcoming.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      activeTab={activeTab}
                      actionButton={
                        !booking.isPaid ? (
                          <Button onClick={() => openPaymentModal(booking.id)} className="bg-[#EB5757] hover:bg-[#D94F4F] text-white">
                            Confirm Payment
                          </Button>
                        ) : booking.status === "CHECKED_IN" ? (
                          <Button
                            onClick={() => handleCheckOut(booking.id)}
                            variant="outline"
                            className="border-[#EB5757]/30 text-[#EB5757] hover:bg-[#FFF6F6] hover:border-[#EB5757]/50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Check Out
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
                }</>
                ))}

              {activeTab === "completed" &&
                (completed.length === 0 ? (
                  <EmptyState icon={CheckCircle2} message="No completed bookings found" />
                ) : (
                  <>
                    <ListHeader />
                    {completed.map((booking) => <BookingCard key={booking.id} booking={booking} activeTab={activeTab} />)}
                  </>
                ))}

              {activeTab === "canceled" &&
                (canceled.length === 0 ? (
                  <EmptyState icon={AlertTriangle} message="No canceled bookings found" />
                ) : (
                  <>
                    <ListHeader />
                    {canceled.map((booking) => <BookingCard key={booking.id} booking={booking} activeTab={activeTab} />)}
                  </>
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
                    <div className="flex flex-col gap-3 mt-2">
                      {roomNumberInputs.map((val, index) => (
                        <div key={index} className="flex flex-col gap-1.5">
                          {roomNumberInputs.length > 1 && (
                            <Label className="text-xs text-[#9E7B6A]">Room {index + 1}</Label>
                          )}
                          <Select 
                            value={val} 
                            onValueChange={(newVal) => {
                              const newArr = [...roomNumberInputs];
                              newArr[index] = newVal;
                              setRoomNumberInputs(newArr);
                            }}
                          >
                            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#F0EBE7] focus:ring-[#C05621]/30">
                              <div className="flex items-center gap-2">
                                <DoorOpen size={14} className="text-[#9E7B6A]" />
                                <SelectValue placeholder={`Select room ${index + 1}`} />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#F0EBE7] shadow-xl">
                              {availableRooms
                                .filter((room) => !roomNumberInputs.includes(room.doorNumber) || roomNumberInputs[index] === room.doorNumber)
                                .map((room) => (
                                <SelectItem key={room.id} value={room.doorNumber}>
                                  Room {room.doorNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckInModalOpen(false)} disabled={processingCheckIn}>Cancel</Button>
                  <Button
                    onClick={handleCheckInSubmit}
                    className="bg-[#1A1A1A] hover:bg-[#C05621] text-white"
                    disabled={processingCheckIn || roomNumberInputs.some(r => !r.trim()) || hasNoRoomsConfigured}
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
