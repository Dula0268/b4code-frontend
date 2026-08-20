"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock, UploadCloud, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";
import { imageApi } from "@/api/image/image.api";
import { toast } from "sonner";
import { validateUploadFile } from "@/lib/file-validator";

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "System Operations",
    employeeId: "ADM-99321",
    avatarUrl: "",
    nationalIdUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [isIdDragging, setIsIdDragging] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        department: "System Operations",
        employeeId: "ADM-99321",
        avatarUrl: user.profile?.avatarUrl || "",
        nationalIdUrl: user.profile?.nationalIdUrl || "",
      });
      if (user.profile?.nationalIdUrl) {
        setIdPreviewUrl(user.profile.nationalIdUrl);
      }
    }
  }, [user]);

  const processIdFile = async (file: File) => {
    const validation = validateUploadFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
    });

    if (!validation.valid) {
      toast.error(validation.error || "Invalid document format");
      return;
    }

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setIdPreviewUrl(url);
    }

    setIsUploadingId(true);

    try {
      const result = await imageApi.upload(file, "identity");
      setFormData((prev) => ({
        ...prev,
        nationalIdUrl: result.url,
      }));
      toast.success("Identity document uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload identity document.");
    } finally {
      setIsUploadingId(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processIdFile(file);
  };

  const handleIdDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIdDragging(true);
  };

  const handleIdDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIdDragging(false);
  };

  const handleIdDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIdDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processIdFile(file);
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
      toast.success("Admin profile details saved successfully!");
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update admin profile.");
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
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Page Title Header */}
      <div className="mb-4 pb-3 border-b border-[#f3eee8]">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#953002] uppercase tracking-wider mb-0.5">
          <UserIcon size={13} />
          <span>System Administration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">Personal & Admin Details</h1>
        <p className="text-[#78716c] text-xs mt-0.5">Manage your administrator profile, department, and security details.</p>
      </div>

      {showSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-xs">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <div>
            <p className="text-xs font-bold">Admin profile updated successfully!</p>
            <p className="text-[11px] text-emerald-600 font-medium">Your changes are active across the management system.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">First Name</label>
            <div className="relative">
              <Input 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange}
                className="h-10 bg-[#faf7f4] border-[#e7e5e4] focus-visible:ring-[#953002]/20 font-semibold text-xs rounded-lg pl-9" 
              />
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Last Name</label>
            <div className="relative">
              <Input 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange}
                className="h-10 bg-[#faf7f4] border-[#e7e5e4] focus-visible:ring-[#953002]/20 font-semibold text-xs rounded-lg pl-9" 
              />
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Input 
                name="email" 
                type="email" 
                value={formData.email}
                disabled
                className="h-10 bg-[#f4f2ef] border-[#e7e5e4] text-[#78716c] font-semibold text-xs rounded-lg pl-9 pr-9" 
              />
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            </div>
            <p className="text-[10px] text-[#a8a29e] mt-0.5 font-medium">Primary admin email is locked for security.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Input 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 7X XXX XXXX"
                className="h-10 bg-[#faf7f4] border-[#e7e5e4] focus-visible:ring-[#953002]/20 font-semibold text-xs rounded-lg pl-9" 
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#a8a29e]">📞</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Department</label>
            <div className="relative">
              <Input 
                name="department" 
                value={formData.department}
                disabled
                className="h-10 bg-[#f4f2ef] border-[#e7e5e4] text-[#78716c] font-semibold text-xs rounded-lg pl-9" 
              />
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Employee / Admin ID</label>
            <div className="relative">
              <Input 
                name="employeeId" 
                value={formData.employeeId}
                disabled
                className="h-10 bg-[#f4f2ef] border-[#e7e5e4] text-[#78716c] font-semibold text-xs rounded-lg pl-9" 
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#a8a29e]">🆔</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Government Identity Document</label>
            <span className="text-[10px] text-[#953002] font-semibold bg-[#953002]/5 px-2 py-0.5 rounded border border-[#953002]/10">
              System Admin Credential
            </span>
          </div>
          <div className="relative">
            {(idPreviewUrl || formData.nationalIdUrl) ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#e5e7eb] group shadow-sm">
                <img src={idPreviewUrl || formData.nationalIdUrl} alt="National ID" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-xs">
                  <label className="cursor-pointer bg-white text-[#1c1917] px-4 py-2 rounded-lg font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95">
                    Change ID Document
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
              <label 
                onDragOver={handleIdDragOver}
                onDragLeave={handleIdDragLeave}
                onDrop={handleIdDrop}
                className={`border-2 border-dashed rounded-xl flex flex-row items-center justify-center py-4 px-5 gap-3 cursor-pointer transition-all relative ${
                  isIdDragging 
                    ? "border-[#953002] bg-[#953002]/5 ring-2 ring-[#953002]/10" 
                    : "border-[#e5e7eb] bg-[#faf7f4] hover:bg-[#f3eee8] hover:border-[#953002]/40"
                }`}
              >
                {isUploadingId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#953002] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-[#953002]">Uploading document...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 bg-white rounded-lg shadow-2xs border border-[#e5e7eb] flex items-center justify-center text-[#953002] shrink-0">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1c1917]">Click to upload or drag & drop admin ID document</p>
                      <p className="text-[10px] text-[#9ca3af]">JPG, PNG, WebP or PDF (max 5MB)</p>
                    </div>
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

        <div className="pt-4 border-t border-[#f3eee8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#9ca3af] max-w-md leading-tight">
            🛡️ Admin credential records are strictly encrypted under internal audit policies.
          </p>
          <Button 
            type="submit" 
            className="w-full sm:w-auto bg-gradient-to-r from-[#953002] to-[#c2410c] hover:from-[#7a2600] hover:to-[#953002] text-white px-7 h-10 font-bold text-xs rounded-lg shadow-md shadow-[#953002]/20 active:scale-98 transition-all"
            disabled={isSaving || isUploadingId}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
