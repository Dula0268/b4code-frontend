"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BedDouble, Users, ImagePlus, X } from "lucide-react";
import { OwnerRoomType, ownerRoomApi } from "@/api/owner/room.api";
import { toast } from "sonner";
import api from "@/lib/axios";
import Image from "next/image";

interface RoomFormModalProps {
  propertyId: number;
  roomToEdit?: OwnerRoomType | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function RoomFormModal({ propertyId, roomToEdit, isOpen, onClose, onSaved }: RoomFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "STANDARD_ROOM",
    roomCategory: "Standard Room",
    basePrice: 0,
    maxAdults: 2,
    maxChildren: 0,
    bedConfigurations: ["1 Double Bed"],
    inventory: 1,
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditMode = !!roomToEdit;

  useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        setFormData({
          name: roomToEdit.name || "STANDARD_ROOM",
          roomCategory: roomToEdit.roomCategory || "Standard Room",
          basePrice: roomToEdit.basePrice || 0,
          maxAdults: roomToEdit.maxAdults || 2,
          maxChildren: roomToEdit.maxChildren || 0,
          bedConfigurations: roomToEdit.bedConfigurations?.length ? roomToEdit.bedConfigurations : ["1 Double Bed"],
          inventory: roomToEdit.inventory || 1,
          imageUrl: roomToEdit.imageUrl || "",
        });
      } else {
        // Reset for new room
        setFormData({
          name: "STANDARD_ROOM",
          roomCategory: "Standard Room",
          basePrice: 100,
          maxAdults: 2,
          maxChildren: 0,
          bedConfigurations: ["1 Double Bed"],
          inventory: 1,
          imageUrl: "",
        });
      }
      setImageFile(null);
    }
  }, [roomToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "name") {
      // Map enum to category name
      const categoryMap: Record<string, string> = {
        STANDARD_ROOM: "Standard Room",
        DELUXE_ROOM: "Deluxe Room",
        SUPERIOR_ROOM: "Superior Room",
        EXECUTIVE_ROOM: "Executive Room",
        TWIN_ROOM: "Twin Room",
        FAMILY_ROOM: "Family Room",
        STUDIO_ROOM: "Studio Room",
        SUITE: "Suite",
        PRESIDENTIAL_SUITE: "Presidential Suite",
        VILLA: "Villa",
      };
      setFormData(prev => ({ ...prev, name: value, roomCategory: categoryMap[value] || value }));
    } else if (name === "bedConfigurations") {
      setFormData(prev => ({ ...prev, bedConfigurations: [value] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("folder", "rooms");
        const res = await api.post<{ url: string }>("/images/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = res.data.url;
      }

      const payload: Partial<OwnerRoomType> = {
        propertyId,
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (isEditMode && roomToEdit) {
        await ownerRoomApi.updateRoom(roomToEdit.id, payload);
        toast.success("Room updated successfully!");
      } else {
        await ownerRoomApi.createRoom(payload);
        toast.success("Room added successfully!");
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save room:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} room.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {isEditMode ? "Edit Room Details" : "Add New Room"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {isEditMode ? "Modify pricing, capacity, and settings for this room." : "Create a new room type for your property."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-6 bg-slate-50/50">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Room Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white overflow-hidden flex-shrink-0 group flex items-center justify-center">
                {imageFile ? (
                  <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill className="object-cover" unoptimized />
                ) : formData.imageUrl ? (
                  <Image src={formData.imageUrl} alt="Room" fill className="object-cover" unoptimized />
                ) : (
                  <ImagePlus className="w-8 h-8 text-slate-300" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                />
              </div>
              <div className="text-sm text-slate-500">
                <p>Click the box to upload a new image.</p>
                <p className="text-xs mt-1">Recommended size: 800x600 (Max 5MB)</p>
                {(imageFile || formData.imageUrl) && (
                  <button 
                    type="button" 
                    className="text-red-500 text-xs mt-2 font-medium hover:underline flex items-center"
                    onClick={() => { setImageFile(null); setFormData(p => ({ ...p, imageUrl: "" })); }}
                  >
                    <X className="w-3 h-3 mr-1" /> Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Room Type</Label>
              <Select onValueChange={(val) => handleSelectChange("name", val)} value={formData.name}>
                <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200 focus:ring-[#953002] focus:border-[#953002]">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="STANDARD_ROOM">Standard Room</SelectItem>
                  <SelectItem value="DELUXE_ROOM">Deluxe Room</SelectItem>
                  <SelectItem value="SUPERIOR_ROOM">Superior Room</SelectItem>
                  <SelectItem value="EXECUTIVE_ROOM">Executive Room</SelectItem>
                  <SelectItem value="TWIN_ROOM">Twin Room</SelectItem>
                  <SelectItem value="FAMILY_ROOM">Family Room</SelectItem>
                  <SelectItem value="STUDIO_ROOM">Studio Room</SelectItem>
                  <SelectItem value="SUITE">Suite</SelectItem>
                  <SelectItem value="PRESIDENTIAL_SUITE">Presidential Suite</SelectItem>
                  <SelectItem value="VILLA">Villa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-slate-700 font-medium">Price per Night (LKR)</Label>
              <Input 
                id="basePrice"
                name="basePrice" 
                type="number"
                min={0}
                value={formData.basePrice} 
                onChange={handleChange} 
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-[#953002] focus:ring-[#953002]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAdults" className="flex items-center gap-2 text-slate-700 font-medium">
                <Users className="w-4 h-4 text-slate-400" /> Base Capacity (Adults)
              </Label>
              <Input 
                id="maxAdults"
                name="maxAdults" 
                type="number"
                min={1}
                value={formData.maxAdults} 
                onChange={handleChange} 
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-[#953002] focus:ring-[#953002]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChildren" className="flex items-center gap-2 text-slate-700 font-medium">
                <Users className="w-4 h-4 text-slate-400" /> Max Capacity (Children)
              </Label>
              <Input 
                id="maxChildren"
                name="maxChildren" 
                type="number"
                min={0}
                value={formData.maxChildren} 
                onChange={handleChange} 
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-[#953002] focus:ring-[#953002]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2 text-slate-700 font-medium">
                <BedDouble className="w-4 h-4 text-slate-400" /> Bed Configuration
              </Label>
              <Select 
                onValueChange={(val) => handleSelectChange("bedConfigurations", val)} 
                value={formData.bedConfigurations[0] || "1 Double Bed"}
              >
                <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200 focus:ring-[#953002] focus:border-[#953002]">
                  <SelectValue placeholder="Select bed configuration" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="1 Double Bed">1 Double Bed</SelectItem>
                  <SelectItem value="2 Single Beds">2 Single Beds</SelectItem>
                  <SelectItem value="1 King Bed">1 King Bed</SelectItem>
                  <SelectItem value="1 King, 1 Sofa Bed">1 King, 1 Sofa Bed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory" className="text-slate-700 font-medium">Total Quantity (Rooms of this type)</Label>
              <Input 
                id="inventory"
                name="inventory" 
                type="number"
                min={1}
                value={formData.inventory} 
                onChange={handleChange} 
                className="h-12 bg-white rounded-xl border-slate-200 focus:border-[#953002] focus:ring-[#953002]"
              />
            </div>

          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center justify-end gap-3 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="rounded-xl h-11 px-6 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || formData.basePrice < 0}
            className="rounded-xl h-11 px-8 bg-[#953002] hover:bg-[#C05621] text-white font-bold shadow-sm"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isEditMode ? "Save Changes" : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
