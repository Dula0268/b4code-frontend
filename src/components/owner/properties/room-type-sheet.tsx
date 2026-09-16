"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OwnerRoomType, OwnerRoomTypeRequest, ownerRoomApi } from "@/api/owner/room.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RoomTypeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: number;
  roomType?: OwnerRoomType | null;
  onSuccess: () => void;
}

const CATEGORIES = ["Standard", "Deluxe", "Suite", "Family", "Studio", "Apartment"];

export default function RoomTypeSheet({ isOpen, onOpenChange, propertyId, roomType, onSuccess }: RoomTypeSheetProps) {
  const [loading, setLoading] = useState(false);
  const [bedInput, setBedInput] = useState("");
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
      setBedInput((roomType.bedConfigurations || []).join(", "));
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
      setBedInput("");
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
      <SheetContent className="overflow-y-auto w-full md:max-w-lg bg-white">
        <SheetHeader>
          <SheetTitle>{roomType ? "Edit Room Type" : "Add Room Type"}</SheetTitle>
          <SheetDescription>
            {roomType ? "Modify the details of your room type." : "Create a new room type for your property."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6 pb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">What do you call this room?</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Deluxe Ocean View"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the room..."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Room Category</Label>
            <Select 
              value={formData.roomCategory} 
              onValueChange={(val) => setFormData({ ...formData, roomCategory: val })}
              required
            >
              <SelectTrigger id="category" className="bg-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="basePrice">Standard nightly rate</Label>
            <Input 
              id="basePrice" 
              type="number" 
              min="0"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value === "" ? "" as unknown as number : Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="inventory">How many of these rooms do you have?</Label>
            <Input 
              id="inventory" 
              type="number" 
              min="1"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value === "" ? "" as unknown as number : Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxAdults">Max Adults</Label>
              <Input 
                id="maxAdults" 
                type="number" 
                min="1"
                value={formData.maxAdults}
                onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value === "" ? "" as unknown as number : Number(e.target.value) })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxChildren">Max Children</Label>
              <Input 
                id="maxChildren" 
                type="number" 
                min="0"
                value={formData.maxChildren}
                onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value === "" ? "" as unknown as number : Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bedConfigurations">Bed Configuration (comma separated)</Label>
            <Input 
              id="bedConfigurations" 
              value={bedInput}
              onChange={(e) => {
                setBedInput(e.target.value);
                setFormData({ 
                  ...formData, 
                  bedConfigurations: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                });
              }}
              placeholder="e.g. 1 King Bed, 1 Sofa Bed"
            />
          </div>

          <SheetFooter className="mt-4 pt-4 border-t border-[#F0EBE7]">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#953002] hover:bg-[#C05621] text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Room Type
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
