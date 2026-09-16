"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, X, Star, ImagePlus, Wifi, LifeBuoy, Utensils, Car, Wind, Dumbbell, Tv, Shirt } from "lucide-react";
import { OwnerProperty } from "@/models/owner";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const AMENITIES_LIST = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "pool", label: "Swimming Pool", icon: LifeBuoy },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "parking", label: "Free Parking", icon: Car },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "gym", label: "Fitness Center", icon: Dumbbell },
  { id: "tv", label: "TV", icon: Tv },
  { id: "washer", label: "Washer", icon: Shirt },
];

interface EditPropertyModalProps {
  property: OwnerProperty | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface ImageEntry {
  preview: string;
  file?: File;
}

export default function EditPropertyModal({ property, isOpen, onClose, onSaved }: EditPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    propertyType: "Hotel",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    customRules: "",
    amenities: [] as string[],
  });

  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || "",
        description: property.description || "",
        address: property.address || "",
        city: property.city || "",
        country: property.country || "Sri Lanka",
        propertyType: property.propertyType || "Hotel",
        checkInTime: property.checkIn || "14:00",
        checkOutTime: property.checkOut || "11:00",
        customRules: property.houseRules || "",
        amenities: property.amenities || [],
      });

      // Handle images from property (we don't have gallery array in OwnerProperty UI type easily accessible, 
      // but let's assume property.image is the cover and we fetch others if available)
      const existingImages = [];
      if (property.image) existingImages.push({ preview: property.image });
      // In a real app we'd fetch full property details including galleryImages. 
      // For now, let's just populate the cover.
      setImageEntries(existingImages);
      setCoverIndex(0);
    }
  }, [property, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newEntries = acceptedFiles.map(file => ({
      preview: URL.createObjectURL(file),
      file,
    }));
    setImageEntries(prev => [...prev, ...newEntries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5242880,
  });

  const removeImage = (index: number) => {
    setImageEntries(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (coverIndex >= updated.length) {
        setCoverIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "properties");
    const res = await api.post<{ url: string }>("/images/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleSubmit = async () => {
    if (!property) return;
    
    setLoading(true);
    try {
      // 1. Upload new images
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageEntries.length; i++) {
        if (imageEntries[i].file) {
          const url = await uploadFile(imageEntries[i].file!);
          uploadedUrls.push(url);
        } else {
          uploadedUrls.push(imageEntries[i].preview);
        }
      }

      const coverPhoto = uploadedUrls.length > 0 ? uploadedUrls[coverIndex] || uploadedUrls[0] : "";
      
      const payload: any = {
        ...formData,
        propertyName: formData.name, // Ensure backend gets propertyName
        coverPhoto,
        images: uploadedUrls,
      };

      await ownerPropertyApi.updateProperty(property.id, payload);
      toast.success("Property details updated successfully!");
      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to update property:", error);
      toast.error("Failed to update property details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <DialogTitle className="text-2xl font-bold text-slate-800">Edit Property Details</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update your property information, amenities, and photos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-10 bg-slate-50/50">
          
          {/* Photos Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Photos & Gallery</h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragActive ? "border-[#953002] bg-[#953002]/5" : "border-slate-200 hover:border-[#953002]/50 hover:bg-white"
              }`}
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-8 w-8 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Drag & drop photos here, or click to select</p>
            </div>
            
            {imageEntries.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imageEntries.map((entry, index) => {
                  const isCover = coverIndex === index;
                  return (
                    <div key={index} className={`relative group rounded-xl overflow-hidden aspect-square ${isCover ? 'ring-4 ring-[#953002] ring-offset-2' : 'border border-slate-200'}`}>
                      <Image src={entry.preview} alt="Gallery" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-between w-full">
                          {isCover ? (
                            <span className="bg-[#953002] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center"><Star size={10} className="mr-1 fill-white"/> Cover</span>
                          ) : <div/>}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
                        </div>
                        {!isCover && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setCoverIndex(index); }} className="bg-white text-slate-900 text-xs font-bold py-1.5 rounded-lg w-full">Make Cover</button>
                        )}
                      </div>
                      {isCover && <div className="absolute top-2 left-2 bg-[#953002] p-1.5 rounded-full shadow-md group-hover:hidden"><Star size={12} className="fill-white"/></div>}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Basic Info Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-700 font-medium">Property Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-700 font-medium">Description</Label>
                <Textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[100px] bg-white rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-700 font-medium">Address Line 1</Label>
                <Input name="address" value={formData.address} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">City</Label>
                <Input name="city" value={formData.city} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Country</Label>
                <Input name="country" value={formData.country} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
            </div>
          </section>

          {/* Amenities Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = formData.amenities.includes(amenity.id);
                const Icon = amenity.icon;
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isChecked ? 'border-[#953002] bg-[#953002]/5' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isChecked ? 'text-[#953002]' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${isChecked ? 'text-[#953002]' : 'text-slate-600'}`}>{amenity.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Policies Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Policies & Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Check-in Time</Label>
                <Input type="time" name="checkInTime" value={formData.checkInTime} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Check-out Time</Label>
                <Input type="time" name="checkOutTime" value={formData.checkOutTime} onChange={handleChange} className="h-12 bg-white rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-700 font-medium">House Rules</Label>
                <Textarea name="customRules" value={formData.customRules} onChange={handleChange} className="min-h-[100px] bg-white rounded-xl" />
              </div>
            </div>
          </section>

        </div>

        <DialogFooter className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0 z-20 flex items-center justify-end gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl h-11 px-6 font-semibold">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.name} className="rounded-xl h-11 px-8 bg-[#953002] hover:bg-[#C05621] text-white font-bold">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
