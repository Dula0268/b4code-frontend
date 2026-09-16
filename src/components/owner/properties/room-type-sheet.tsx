"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OwnerRoomType, OwnerRoomTypeRequest, ownerRoomApi } from "@/api/owner/room.api";
import { toast } from "sonner";
import { Loader2, BedDouble, Users } from "lucide-react";

interface RoomTypeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: number;
  roomType?: OwnerRoomType | null;
  onSuccess: () => void;
}

const ROOM_TYPE_OPTIONS = [
  { value: "STANDARD_ROOM", label: "Standard Room" },
  { value: "DELUXE_ROOM", label: "Deluxe Room" },
  { value: "SUPERIOR_ROOM", label: "Superior Room" },
  { value: "EXECUTIVE_ROOM", label: "Executive Room" },
  { value: "TWIN_ROOM", label: "Twin Room" },
  { value: "FAMILY_ROOM", label: "Family Room" },
  { value: "STUDIO_ROOM", label: "Studio Room" },
  { value: "SUITE", label: "Suite" },
  { value: "PRESIDENTIAL_SUITE", label: "Presidential Suite" },
  { value: "VILLA", label: "Villa" },
];

export default function RoomTypeSheet({ isOpen, onOpenChange, propertyId, roomType, onSuccess }: RoomTypeSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OwnerRoomTypeRequest>({
    propertyId: propertyId,
    name: "",
    description: "",
    roomCategory: "",
    basePrice: "" as unknown as number,
    inventory: 1,
    maxAdults: 2,
    maxChildren: 0,
    amenities: [],
    bedConfigurations: [],
  });

  useEffect(() => {
    if (roomType && isOpen) {
      setFormData({
        propertyId,
        name: roomType.name || "",
        description: roomType.description || "",
        roomCategory: roomType.roomCategory || "",
        basePrice: roomType.basePrice ?? 0,
        inventory: roomType.inventory || 1,
        maxAdults: roomType.maxAdults || 2,
        maxChildren: roomType.maxChildren ?? 0,
        amenities: roomType.amenities || [],
        bedConfigurations: roomType.bedConfigurations || [],
      });
    } else if (!roomType && isOpen) {
      setFormData({
        propertyId,
        name: "",
        description: "",
        roomCategory: "",
        basePrice: "" as unknown as number,
        inventory: 1,
        maxAdults: 2,
        maxChildren: "" as unknown as number,
        amenities: [],
        bedConfigurations: [],
      });
    }
  }, [roomType, propertyId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (roomType) {
        await ownerRoomApi.updateRoom(roomType.id, formData);
        toast.success("Room type updated successfully");
      } else {
        await ownerRoomApi.createRoom(formData);
        toast.success("Room type created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save room type");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full md:max-w-xl bg-white sm:max-w-xl">
        <SheetHeader className="mb-6">
          <SheetTitle>{roomType ? "Edit Room Type" : "Add Room Type"}</SheetTitle>
          <SheetDescription>
            {roomType ? "Modify the details of your room type." : "Create a new room type for your property."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                  <BedDouble className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Room Details</h3>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1 space-y-2">
                <Label className="text-slate-700 font-medium">Room Type</Label>
                <Select 
                  value={formData.roomCategory} 
                  onValueChange={(val) => {
                    const selectedOption = ROOM_TYPE_OPTIONS.find(opt => opt.value === val);
                    setFormData({ 
                      ...formData, 
                      roomCategory: val,
                      name: selectedOption ? selectedOption.label : val
                    });
                  }}
                  required
                >
                  <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {ROOM_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg cursor-pointer">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 space-y-2">
                <Label className="text-slate-700 font-medium">Price per Night (LKR)</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="0.01"
                  placeholder="0.00" 
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value === "" ? "" as unknown as number : parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-700 font-medium">Number of Rooms (How many do you have?)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                  value={formData.inventory}
                  onChange={(e) => setFormData({ ...formData, inventory: e.target.value === "" ? "" as unknown as number : parseInt(e.target.value, 10) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  Base Capacity
                </Label>
                <Input 
                  type="number" 
                  min="1" 
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                  value={formData.maxAdults}
                  onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value === "" ? "" as unknown as number : parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  Max Capacity
                </Label>
                <Input 
                  type="number" 
                  min="1" 
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl"
                  value={formData.maxChildren}
                  onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value === "" ? "" as unknown as number : parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-700 font-medium">Bed Configuration</Label>
                <Select 
                  value={formData.bedConfigurations?.[0] || ""} 
                  onValueChange={(val) => setFormData({ ...formData, bedConfigurations: [val] })}
                  required
                >
                  <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all rounded-xl">
                    <SelectValue placeholder="Select bed configuration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="1 Double Bed" className="rounded-lg cursor-pointer">1 Double Bed</SelectItem>
                    <SelectItem value="2 Single Beds" className="rounded-lg cursor-pointer">2 Single Beds</SelectItem>
                    <SelectItem value="1 King Bed" className="rounded-lg cursor-pointer">1 King Bed</SelectItem>
                    <SelectItem value="1 King, 1 Sofa Bed" className="rounded-lg cursor-pointer">1 King, 1 Sofa Bed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter className="pt-2">
            <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-900 font-medium rounded-xl px-6 transition-all" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[var(--brand-primary)] hover:opacity-90 text-white font-medium rounded-xl px-8 shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-200 hover:-translate-y-0.5">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Room Type
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
