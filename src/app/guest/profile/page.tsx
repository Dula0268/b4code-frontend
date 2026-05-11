"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock, UploadCloud, User as UserIcon, Camera } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";
import { imageApi } from "@/lib/api";
import { useGuestGuard } from "@/hooks/use-guest-guard";

export default function GuestProfilePage() {
  const { ready } = useGuestGuard()
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    nationalIdUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync form data with user store data
  useEffect(() => {
    if (ready && user) {
      setFormData({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        avatarUrl: user.profile?.avatarUrl || "",
        nationalIdUrl: user.profile?.nationalIdUrl || "",
      });
    }
  }, [ready, user]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingId(true);

    try {
      const result = await imageApi.upload(file, "identity");
      setFormData(prev => ({
        ...prev,
        nationalIdUrl: result.url
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const emailToUse = user?.email || "";
      await updateProfile(emailToUse, { 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        nationalIdUrl: formData.nationalIdUrl
      });
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">First Name</label>
            <Input 
              name="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">Last Name</label>
            <Input 
              name="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              className="h-11 bg-[#fdfaf8] border-[#e7e5e4] focus-visible:ring-[#953002]/20" 
            />
          </div>
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
          <p className="text-[11px] text-[#a8a29e] mt-1">Email address cannot be changed for guest accounts.</p>
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

        <div className="space-y-3">
          <label className="text-sm font-medium text-[#44403c]">Government ID</label>
          <div className="relative">
            {formData.nationalIdUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#e5e7eb] group">
                <img src={formData.nationalIdUrl} alt="National ID" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-[#1c1917] px-4 py-2 rounded-lg font-bold text-sm hover:bg-neutral-100 transition-colors">
                    Change ID Photo
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,application/pdf" 
                      onChange={(e) => handleFileUpload(e)}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-10 px-6 bg-[#fafafa] cursor-pointer hover:bg-[#f3f4f6] transition-colors relative">
                {isUploadingId ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-[#953002] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-medium text-[#953002]">Uploading identity document...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-md shadow-sm border border-[#e5e7eb] flex items-center justify-center mb-3">
                      <UploadCloud size={20} className="text-[#c2410c]" />
                    </div>
                    <p className="font-semibold text-sm text-[#374151] mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-[#9ca3af]">SVG, PNG, JPG or PDF (max. 5MB). Required for international bookings.</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,application/pdf" 
                  onChange={(e) => handleFileUpload(e)}
                  disabled={isUploadingId}
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-[#f3f4f6] flex items-center justify-between">
          <p className="text-xs text-[#9ca3af] max-w-sm leading-relaxed">
            Your personal data is encrypted and secure. We only share necessary details with host partners upon confirmed bookings.
          </p>
          <Button 
            type="submit" 
            className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 transition-colors h-11 font-medium rounded-xl"
            disabled={isSaving || isUploadingId}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
