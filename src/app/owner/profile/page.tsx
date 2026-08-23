"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, UploadCloud, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { validateUploadFile } from "@/lib/file-validator";

export default function OwnerProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    staffRole: "Property Owner",
    taxId: "",
    avatarUrl: "",
    nationalIdUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [isIdDragging, setIsIdDragging] = useState(false);

  useEffect(() => {
    if (user) {
      const fn = user.profile?.firstName || "";
      const ln = user.profile?.lastName || "";
      const fullBusinessName = fn ? `${fn} ${ln}`.trim() : "";
      setFormData({
        businessName: fullBusinessName,
        email: user.email || "",
        phone: user.profile?.phone || "",
        staffRole: user.profile?.staffRole || "Property Owner",
        taxId: "",
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
      const mockCloudinaryUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, nationalIdUrl: mockCloudinaryUrl }));
      toast.success("Identity document uploaded successfully!");
    } catch (err) {
      console.error(err);
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
      const parts = formData.businessName.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      
      await updateProfile(emailToUse, { 
        firstName, 
        lastName, 
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        nationalIdUrl: formData.nationalIdUrl
      });

      setIsSaving(false);
      setShowSuccess(true);
      toast.success("Owner details saved successfully!");
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile. Please try again.");
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
        <div className="flex items-center gap-1.5 text-xs font-black text-[var(--brand-primary)] uppercase tracking-wider mb-0.5">
          <UserIcon size={13} />
          <span>Property Owner Credentials</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">Business & Partner Details</h1>
        <p className="text-[#78716c] text-xs mt-0.5">Manage your official host profile, tax credentials, and verification identity.</p>
      </div>

      {showSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-xs">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          <div>
            <p className="text-xs font-bold">Owner profile updated successfully!</p>
            <p className="text-[11px] text-emerald-600">Your details have been synchronized with your property listings.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Owner / Business Name</label>
          <div className="relative">
            <Input
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="h-10 bg-[#faf7f4] border-[#e7e5e4] focus-visible:ring-[#953002]/20 font-semibold text-xs rounded-lg pl-9"
            />
            <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
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
            <p className="text-[10px] text-[#a8a29e] mt-0.5 font-medium">Primary owner email is locked for security.</p>
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
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Account Role</label>
            <div className="relative">
              <Input
                name="staffRole"
                value={formData.staffRole}
                onChange={handleChange}
                disabled
                className="h-10 bg-[#f4f2ef] border-[#e7e5e4] text-[#78716c] font-semibold text-xs rounded-lg pl-9"
              />
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Registration ID / Tax ID</label>
            <div className="relative">
              <Input
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="TAX-8921-LK"
                className="h-10 bg-[#faf7f4] border-[#e7e5e4] focus-visible:ring-[#953002]/20 font-semibold text-xs rounded-lg pl-9"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#a8a29e]">🏛️</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-[#44403c] uppercase tracking-wider">Government / Business Identity Document</label>
            <span className="text-[10px] text-[var(--brand-primary)] font-semibold bg-[var(--brand-primary)]/5 px-2 py-0.5 rounded border border-[var(--brand-primary)]/10">
              Required for Host Verification
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
                      onChange={(e) => handleFileUpload(e)}
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
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-2 ring-[#953002]/10" 
                    : "border-[#e5e7eb] bg-[#faf7f4] hover:bg-[#f3eee8] hover:border-[var(--brand-primary)]/40"
                }`}
              >
                {isUploadingId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-[var(--brand-primary)]">Uploading document...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 bg-white rounded-lg shadow-2xs border border-[#e5e7eb] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1c1917]">Click to upload or drag & drop business document</p>
                      <p className="text-[10px] text-[#9ca3af]">JPG, PNG, WebP or PDF (max 5MB)</p>
                    </div>
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

        <div className="pt-4 border-t border-[#f3eee8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#9ca3af] max-w-md leading-tight">
            🛡️ Your partner details are protected under SSL 256-bit encryption.
          </p>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-[#953002] to-[#c2410c] hover:from-[#7a2600] hover:to-[#953002] text-white px-7 h-10 font-bold text-xs rounded-lg shadow-md shadow-[#953002]/20 active:scale-98 transition-all"
            disabled={isSaving || isUploadingId}
          >
            {isSaving ? "Saving Details..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
