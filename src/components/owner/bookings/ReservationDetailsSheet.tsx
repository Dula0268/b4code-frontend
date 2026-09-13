"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Reservation, useOwnerBookingStore } from "@/store/owner/booking.store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserIcon, BedIcon, CreditCardIcon } from "lucide-react";
import { format } from "date-fns";

interface ReservationDetailsSheetProps {
  reservationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReservationDetailsSheet({ reservationId, isOpen, onClose }: ReservationDetailsSheetProps) {
  const { reservations } = useOwnerBookingStore();
  const reservation = reservations.find((r) => r.id === reservationId);

  if (!reservation) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Reservation Details</SheetTitle>
          <SheetDescription>
            ID: {reservation.id}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-slate-500" />
              {reservation.guestName}
            </h3>
            <Badge variant={reservation.status === "CONFIRMED" ? "default" : "secondary"}>
              {reservation.status}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium">Dates</p>
                <p className="text-sm text-slate-600">
                  {format(new Date(reservation.checkIn), "MMM dd, yyyy")} - {format(new Date(reservation.checkOut), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BedIcon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium">Room Type</p>
                <p className="text-sm text-slate-600">{reservation.roomType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCardIcon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium">Payout</p>
                <p className="text-sm text-slate-600">${reservation.payout.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
