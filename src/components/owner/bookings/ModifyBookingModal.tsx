"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reservation, useOwnerBookingStore } from "@/store/owner/booking.store";
import { useState } from "react";
import { toast } from "sonner";

interface ModifyBookingModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModifyBookingModal({ reservation, isOpen, onClose }: ModifyBookingModalProps) {
  const { modifyReservation } = useOwnerBookingStore();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // When modal opens, sync local state
  if (reservation && !checkIn) {
    setCheckIn(new Date(reservation.checkIn).toISOString().split("T")[0]);
    setCheckOut(new Date(reservation.checkOut).toISOString().split("T")[0]);
  }

  const handleSave = () => {
    if (reservation) {
      // Very basic mock calculation
      modifyReservation(reservation.id, {
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });
      toast.success("Reservation modified successfully");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modify Reservation</DialogTitle>
        </DialogHeader>
        {reservation && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkin">Check-in Date</Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout">Check-out Date</Label>
              <Input
                id="checkout"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
