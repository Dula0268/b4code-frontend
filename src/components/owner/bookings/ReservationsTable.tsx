"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useOwnerBookingStore } from "@/store/owner/booking.store";
import { ownerReservationApi } from "@/api/owner/owner-reservation.api";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, AlertTriangle, BedDouble, User } from "lucide-react";
import { toast } from "sonner";
import ReservationDetailsSheet from "./ReservationDetailsSheet";

type TabKey = "upcoming" | "completed" | "canceled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];

function BookingCard({ 
  booking, 
  activeTab,
  onHoldToggle,
  onViewDetails
}: { 
  booking: any; 
  activeTab: TabKey;
  onHoldToggle: (id: number, currentStatus: boolean) => void;
  onViewDetails: (id: number) => void;
}) {
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
            {booking.lateArrivalAllowed && activeTab === 'upcoming' && (
              <span className="ml-1 text-[9px] uppercase tracking-wider font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full shadow-sm">
                Held
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
      <div className="flex flex-row items-center gap-3 z-10 shrink-0 md:justify-end mt-2 md:mt-0 min-w-[200px]">
        {activeTab !== "upcoming" && (
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
          </div>
        )}
        
        {activeTab === "upcoming" && (
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7B6A]">Start Date</span>
              <span className="text-xs font-bold text-[#1A1A1A]">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button 
                onClick={() => onHoldToggle(booking.id, booking.lateArrivalAllowed)} 
                variant="outline"
                className={`border-[#C05621]/30 text-[#C05621] hover:bg-[#FFF8F0] hover:border-[#C05621]/50 ${booking.lateArrivalAllowed ? 'bg-[#FFF8F0] border-[#C05621]/50' : ''}`}
                size="sm"
              >
                {booking.lateArrivalAllowed ? "Unhold" : "Hold"}
              </Button>
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
      <div className="shrink-0 flex items-center justify-end min-w-[200px]">
        Action
      </div>
    </div>
  );
}

export default function ReservationsTable() {
  const { reservations, selectedPropertyId, fetchReservations } = useOwnerBookingStore();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [processingHoldId, setProcessingHoldId] = useState<number | null>(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      // Filter by property
      if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
      return true;
    });
  }, [reservations, selectedPropertyId]);

  const todayStr = useMemo(() => {
    return format(new Date(), "yyyy-MM-dd");
  }, []);

  const upcoming = useMemo(() => filteredReservations.filter((r) => {
    const isUpcomingStatus = r.status === "CONFIRMED" || r.status === "PENDING" || r.status === "CHECKED_IN";
    return isUpcomingStatus && (r.checkOut && r.checkOut >= todayStr);
  }), [filteredReservations, todayStr]);
  const completed = useMemo(() => filteredReservations.filter((r) => r.status === "COMPLETED"), [filteredReservations]);
  const canceled = useMemo(() => filteredReservations.filter((r) => r.status === "CANCELED" || r.status === "CANCELLED" || r.status === "NO_SHOW"), [filteredReservations]);

  const counts: Record<TabKey, number> = {
    upcoming: upcoming.length,
    completed: completed.length,
    canceled: canceled.length,
  };

  const handleHoldToggle = async (id: number, currentStatus: boolean) => {
    try {
      setProcessingHoldId(id);
      await ownerReservationApi.toggleLateArrival(id, !currentStatus);
      toast.success(currentStatus ? "Late arrival hold removed" : "Booking held for late arrival");
      await fetchReservations(); // Refresh store data
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle late arrival");
    } finally {
      setProcessingHoldId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
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
                  onHoldToggle={handleHoldToggle}
                  onViewDetails={setSelectedResId}
                />
              ))}
            </>
          ))}

        {activeTab === "completed" &&
          (completed.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="No completed bookings found" />
          ) : (
            <>
              <ListHeader />
              {completed.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  activeTab={activeTab} 
                  onHoldToggle={handleHoldToggle}
                  onViewDetails={setSelectedResId}
                />
              ))}
            </>
          ))}

        {activeTab === "canceled" &&
          (canceled.length === 0 ? (
            <EmptyState icon={AlertTriangle} message="No canceled bookings found" />
          ) : (
            <>
              <ListHeader />
              {canceled.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  activeTab={activeTab} 
                  onHoldToggle={handleHoldToggle}
                  onViewDetails={setSelectedResId}
                />
              ))}
            </>
          ))}
      </div>

      {selectedResId !== null && (
        <ReservationDetailsSheet
          reservationId={selectedResId}
          isOpen={true}
          onClose={() => setSelectedResId(null)}
        />
      )}
    </div>
  );
}
