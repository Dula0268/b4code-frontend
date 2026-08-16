"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock, UploadCloud, ShieldCheck, Mail, Phone, Briefcase, Building } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";
import { imageApi } from "@/api/image/image.api";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffRole: "",
    assignedProperty: "",
    avatarUrl: "",
    nationalIdUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [propertyName, setPropertyName] = useState<string>("");

  useEffect(() => {
    const pid = user?.propertyId;
    if (pid) {
      import("@/api/properties/properties.api").then(({ propertiesApi }) => {
        propertiesApi.getPublicList().then((list) => {
          const prop = list.find((p) => p.id === Number(pid));
          if (prop) setPropertyName(prop.name);
        }).catch(console.error);
      });
    }
  }, [user?.propertyId]);

  // Sync form data with user store data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        staffRole: user.profile?.staffRole || "Staff",
        assignedProperty: propertyName || (user.propertyId ? "Property #" + user.propertyId : "Unassigned"),
        avatarUrl: user.profile?.avatarUrl || "",
        nationalIdUrl: user.profile?.nationalIdUrl || "",
      });
    }
  }, [user, propertyName]);

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
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Personal Details</h1>
        <p className="text-neutral-500 text-[15px]">Manage your personal information and official identification documents.</p>
      </div>

      {showSuccess && (
        <div className="mb-8 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-5 py-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="text-[#22c55e]" size={20} />
          <p className="font-medium text-sm">Your profile has been successfully updated.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Personal Information */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-800">Basic Information</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="h-12 bg-white border-neutral-200 text-neutral-900 focus-visible:ring-[#953002]/30 text-[15px] rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="h-12 bg-white border-neutral-200 text-neutral-900 focus-visible:ring-[#953002]/30 text-[15px] rounded-xl"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Phone Number</label>
              <div className="relative">
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-12 bg-white border-neutral-200 pl-11 text-neutral-900 focus-visible:ring-[#953002]/30 text-[15px] rounded-xl"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Official Identification */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-800">Official Identification</h2>
          </div>
          
          <div className="p-6">
            <div className="relative max-w-xl">
              {formData.nationalIdUrl ? (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-neutral-200 group bg-neutral-100">
                  <img src={formData.nationalIdUrl} alt="National ID" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-neutral-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-neutral-50 transition-colors shadow-lg">
                      Upload New ID
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center py-14 px-6 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors relative group">
                  {isUploadingId ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-[#953002]/30 border-t-[#953002] rounded-full animate-spin mb-4"></div>
                      <p className="text-sm font-semibold text-[#953002]">Uploading document securely...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-neutral-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <UploadCloud size={24} className="text-neutral-500" />
                      </div>
                      <p className="font-semibold text-[15px] text-neutral-800 mb-1">Upload Government ID</p>
                      <p className="text-sm text-neutral-500 text-center max-w-[260px]">
                        SVG, PNG, JPG or PDF. Maximum file size of 5MB.
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploadingId}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Account & Employment Details (Read-only) */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-[#fdfaf8] flex items-center gap-2">
            <ShieldCheck className="text-[#953002]" size={20} />
            <h2 className="text-lg font-semibold text-[#953002]">Account & Employment Details</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 gap-5">
            <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100 flex items-start gap-4">
              <div className="mt-1 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
                <Mail className="text-neutral-500" size={18} />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1 block">Registered Email</label>
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-medium text-neutral-800">{formData.email}</p>
                  <Lock size={14} className="text-neutral-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100 flex items-start gap-4">
                <div className="mt-1 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
                  <Briefcase className="text-neutral-500" size={18} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1 block">Staff Role</label>
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-medium text-neutral-800">{formData.staffRole}</p>
                    <Lock size={14} className="text-neutral-300" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100 flex items-start gap-4">
                <div className="mt-1 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
                  <Building className="text-neutral-500" size={18} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1 block">Assigned Property</label>
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-medium text-neutral-800">{formData.assignedProperty}</p>
                    <Lock size={14} className="text-neutral-300" />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-neutral-400 mt-2 px-2">
              Employment details and email address are locked by the property administrator. Contact support if changes are required.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end pt-4 pb-12">
          <Button
            type="submit"
            className="bg-[#953002] hover:bg-[#7a2600] text-white px-10 h-12 text-[15px] font-bold rounded-xl shadow-md shadow-[#953002]/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
            disabled={isSaving || isUploadingId}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Updates...
              </div>
            ) : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
