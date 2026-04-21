"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock, UploadCloud } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";

export default function OwnerProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "",
    staffRole: "",
    assignedProperty: "",
    propertyAddress: "",
    country: "",
    taxId: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const emailToUse = user?.email || "owner@primestay.com";
      const newName = formData.businessName.trim() || user?.name || "Owner";
      await updateProfile(emailToUse, { name: newName });
      
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1c1917] mb-2">Personal Details</h1>
        <p className="text-[#78716c] text-sm">Manage your public and private information used for travel bookings.</p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="text-green-500" size={20} />
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Owner / Business Name</label>
          <Input 
            name="businessName" 
            value={formData.businessName}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Email Address</label>
          <div className="relative">
            <Input 
              name="email" 
              type="email" 
              value={formData.email}
              disabled
              className="h-11 bg-[#fcfcfc] border-[#e7e5e4] pr-10 text-[#78716c]" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Lock size={16} className="text-[#a8a29e]" />
            </div>
          </div>
          <p className="text-[11px] text-[#a8a29e] mt-1">Email address cannot be changed for owner accounts.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Phone Number</label>
          <Input 
            name="phone" 
            value={formData.phone}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Staff Role</label>
          <Input 
            name="staffRole" 
            value={formData.staffRole}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Assigned Property</label>
          <Input 
            name="assignedProperty" 
            value={formData.assignedProperty}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Property Address</label>
          <Input 
            name="propertyAddress" 
            value={formData.propertyAddress}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Country</label>
          <Input 
            name="country" 
            value={formData.country}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#44403c]">Registration ID/ Tax ID</label>
          <Input 
            name="taxId" 
            value={formData.taxId}
            onChange={handleChange}
            className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20 w-full" 
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-[#44403c]">Government ID</label>
          <div className="border-2 border-dashed border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-10 px-6 bg-[#fafafa] cursor-pointer hover:bg-[#f3f4f6] transition-colors">
            <div className="w-10 h-10 bg-white rounded-md shadow-sm border border-[#e5e7eb] flex items-center justify-center mb-3">
              <UploadCloud size={20} className="text-[#c2410c]" />
            </div>
            <p className="font-semibold text-sm text-[#374151] mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-[#9ca3af]">SVG, PNG, JPG or PDF (max. 5MB). Required for international bookings.</p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#f3f4f6] flex items-center justify-between">
          <p className="text-xs text-[#9ca3af] max-w-sm leading-relaxed">
            Your personal data is encrypted and secure. We only share necessary details with host partners upon confirmed bookings.
          </p>
          <Button 
            type="submit" 
            className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 transition-colors h-11 font-medium rounded-xl"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
