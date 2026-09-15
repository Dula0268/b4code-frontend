"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OwnerHeader from "@/components/owner/layout/owner-header";
import NotificationSettingsPanel from "@/components/owner/settings/notification-settings-panel";
import BillingSettingsPanel from "@/components/owner/settings/billing-settings-panel";
import { useAuthStore } from "@/store/auth/auth.store";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import { imageApi } from "@/api/image/image.api";
import { validateUploadFile } from "@/lib/file-validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Bell, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Loader2,
  Building2,
  FileText,
  Banknote
} from "lucide-react";
import clsx from "clsx";

type SettingsTab = "profile" | "verification" | "security" | "billing" | "notifications";

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#faf7f5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#953002]" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { ready } = useOwnerGuard();
  const { user, updateProfile, updatePassword } = useAuthStore();
  const searchParams = useSearchParams();

  const verifyRequired = searchParams.get("verify") === "required" || searchParams.get("tab") === "verification";

  const [activeTab, setActiveTab] = useState<SettingsTab>(verifyRequired ? "verification" : "profile");

  useEffect(() => {
    if (verifyRequired) {
      setActiveTab("verification");
    }
  }, [verifyRequired]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    nationalIdUrl: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Identity Verification State
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [isIdDragging, setIsIdDragging] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);

  // Helper to get viewable document URL (converts Cloudinary .pdf to .png to prevent 401 error)
  const getDocumentViewUrl = (url: string | null) => {
    if (!url) return "";
    if (url.includes("cloudinary.com") && url.includes("/image/upload/") && url.toLowerCase().endsWith(".pdf")) {
      return url.replace(/\.pdf$/i, ".png");
    }
    return url;
  };

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        avatarUrl: user.profile?.avatarUrl || "",
        nationalIdUrl: user.profile?.nationalIdUrl || "",
      });
      if (user.profile?.nationalIdUrl) {
        setIdPreviewUrl(user.profile.nationalIdUrl);
      }
    }
  }, [user]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf7f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#953002]" />
          <p className="text-sm font-semibold text-neutral-600">Loading Account Settings...</p>
        </div>
      </div>
    );
  }

  // ── Avatar Handlers ──
  const handleAvatarFile = async (file: File) => {
    if (!user?.email) return;

    const validation = validateUploadFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (!validation.valid) {
      toast.error(validation.error || "Invalid image file");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await imageApi.upload(file, "avatars");
      setProfileForm((prev) => ({ ...prev, avatarUrl: result.url }));
      await updateProfile(user.email, { avatarUrl: result.url });
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Failed to upload profile photo. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.email) return;
    setIsUploadingAvatar(true);
    try {
      setProfileForm((prev) => ({ ...prev, avatarUrl: "" }));
      await updateProfile(user.email, { avatarUrl: "" });
      toast.success("Profile photo removed.");
    } catch (err) {
      console.error("Failed to remove avatar:", err);
      toast.error("Failed to remove profile photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Profile Save Handler ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsSavingProfile(true);
    try {
      await updateProfile(user.email, {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        avatarUrl: profileForm.avatarUrl,
        nationalIdUrl: profileForm.nationalIdUrl,
      });
      toast.success("Profile information saved successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Identity Document Upload Handler ──
  const processIdFile = async (file: File) => {
    if (!user?.email) return;

    const validation = validateUploadFile(file, {
      maxSizeMB: 8,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
    });

    if (!validation.valid) {
      toast.error(validation.error || "Invalid document file");
      return;
    }

    if (file.type.startsWith("image/")) {
      setIdPreviewUrl(URL.createObjectURL(file));
    }

    setIsUploadingId(true);
    try {
      const result = await imageApi.upload(file, "identity");
      setProfileForm((prev) => ({ ...prev, nationalIdUrl: result.url }));
      setIdPreviewUrl(result.url);
      setIsEditingDoc(false);

      await updateProfile(user.email, {
        nationalIdUrl: result.url,
      });

      toast.success("Government ID / Business Registration document uploaded successfully!");
    } catch (err: unknown) {
      console.error("ID upload failed:", err);
      const message = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        "Failed to upload identity document. Please try again.";
      toast.error(message);
    } finally {
      setIsUploadingId(false);
    }
  };

  // ── Password Change Handler ──
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (securityForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword(user.email, securityForm.currentPassword, securityForm.newPassword);
      toast.success("Password changed successfully!");
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      console.error("Password change failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to change password. Please check your current password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const isVerified = Boolean(profileForm.nationalIdUrl || user?.profile?.nationalIdUrl);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f5]">
      <OwnerHeader 
        title="Settings & Profile" 
        subtitle="Manage your profile information, host verification, password security, and notification preferences." 
      />

      <main className="flex-1 p-4 sm:p-6 md:p-8 mt-[64px] max-w-5xl mx-auto w-full space-y-6">
        
        {/* Verification Required Alert Banner */}
        {verifyRequired && !isVerified && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex items-start gap-3.5 animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-amber-950">Identity Verification Required to Unlock Dashboard</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your owner account features (Rates, Bookings, Staff Management) are locked until you upload your Government National ID Card (NIC Front & Back), Passport, or Business Registration document below. Once uploaded, your dashboard will be instantly unlocked.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-neutral-200/80 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "profile"
                ? "bg-[#953002] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <User size={15} />
            Profile & Account
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "verification"
                ? "bg-[#953002] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <ShieldCheck size={15} />
            Identity Verification
            {isVerified ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 text-[10px] font-extrabold">
                VERIFIED
              </span>
            ) : (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 text-[10px] font-extrabold">
                REQUIRED
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "security"
                ? "bg-[#953002] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <Lock size={15} />
            Login & Security
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("billing")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "billing"
                ? "bg-[#953002] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <Banknote size={15} />
            Billing & Payouts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "notifications"
                ? "bg-[#953002] text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            <Bell size={15} />
            Notifications
          </button>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 1: PROFILE INFORMATION */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Profile & Host Information</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Your personal details, contact number, and host badge information displayed to guests.
              </p>
            </div>

            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-neutral-100">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#953002]/20 bg-[#faf7f5] shadow-xs flex items-center justify-center">
                  {profileForm.avatarUrl ? (
                    <img 
                      src={profileForm.avatarUrl} 
                      alt="Owner Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-black text-[#953002]">
                      {profileForm.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "O"}
                    </div>
                  )}
                </div>

                <label 
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#953002] hover:bg-[#7a2702] text-white flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-95"
                  title="Upload profile photo"
                >
                  <Camera size={14} />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    disabled={isUploadingAvatar}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarFile(file);
                    }}
                  />
                </label>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="font-bold text-base text-neutral-900">
                    {profileForm.firstName || profileForm.lastName 
                      ? `${profileForm.firstName} ${profileForm.lastName}`.trim() 
                      : user?.email}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#953002]/10 text-[#953002] text-[10px] font-extrabold uppercase">
                    Property Owner
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Recommended: Square JPG or PNG, at least 400x400 pixels (Max 5MB).
                </p>
                {profileForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer pt-1"
                  >
                    <Trash2 size={13} />
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700">First Name</Label>
                  <Input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700">Last Name</Label>
                  <Input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-neutral-700">Email Address</Label>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  </div>
                  <Input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="h-11 rounded-xl bg-neutral-100/80 border-neutral-200 text-neutral-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700">Phone Number</Label>
                  <Input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="0777646946"
                    className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#953002] hover:bg-[#7a2702] text-white font-bold text-xs h-11 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 2: IDENTITY VERIFICATION (STEP 1.2) */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "verification" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Host Identity & Business Verification</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Upload your Government National Identity Card (NIC Front/Back), Passport, or Business Registration.
                </p>
              </div>

              <div>
                {isVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Identity Verified
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <AlertCircle size={15} className="text-amber-600" />
                    Verification Required
                  </div>
                )}
              </div>
            </div>

            {/* Why Verification Matters Callout */}
            <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-2xl p-4 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-[#9a3412]">
                <p className="font-bold">Why do we require Identity Verification?</p>
                <p className="leading-relaxed text-[#c2410c]">
                  To protect guests and prevent fraudulent listings, PrimeStay requires all property owners to maintain a valid government ID or registered business document on file. Verification also unlocks automatic payout processing.
                </p>
              </div>
            </div>

            {/* If document is already uploaded and not editing */}
            {idPreviewUrl && !isEditingDoc ? (
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#953002]/10 border border-[#953002]/20 flex items-center justify-center shrink-0">
                      <FileText size={24} className="text-[#953002]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-neutral-900 truncate">Identity_Document_On_File</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Your government ID or business certificate is securely verified on file.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={getDocumentViewUrl(idPreviewUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-800 shadow-sm transition-all no-underline"
                    >
                      <ExternalLink size={14} />
                      View Document
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingDoc(true)}
                      className="h-9 text-xs font-bold text-[#953002] border-[#953002]/30 hover:bg-[#953002]/5 rounded-xl"
                    >
                      Replace Document
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Document Upload Box */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-neutral-700">
                    {idPreviewUrl ? "Upload Replacement Document" : "National ID (NIC) / Business Registration Document"}
                  </Label>
                  {idPreviewUrl && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDoc(false)}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsIdDragging(true);
                  }}
                  onDragLeave={() => setIsIdDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsIdDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processIdFile(file);
                  }}
                  className={clsx(
                    "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all",
                    isIdDragging
                      ? "border-[#953002] bg-[#fff7ed]"
                      : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50"
                  )}
                >
                  {isUploadingId ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
                      <p className="text-xs font-bold text-neutral-700">Uploading and securing document...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#953002]/10 text-[#953002] flex items-center justify-center mb-3">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-neutral-800">
                        Drag & drop your document here, or{" "}
                        <label className="text-[#953002] hover:underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) processIdFile(file);
                            }}
                          />
                        </label>
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Supports PNG, JPG, WEBP, or PDF (Max 8MB). Encrypted & securely stored.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 3: LOGIN & SECURITY */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Login & Password Security</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Ensure your property owner account uses a strong, unique password.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700">Current Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700">New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                  required
                />
                <p className="text-[11px] text-neutral-400">
                  Must be at least 8 characters with numbers and special characters.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  className="h-11 rounded-xl bg-neutral-50/70 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/40"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSavingPassword}
                  className="bg-[#953002] hover:bg-[#7a2702] text-white font-bold text-xs h-11 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 4: NOTIFICATIONS */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-100">
            <NotificationSettingsPanel />
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 5: BILLING & PAYOUTS */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-100">
            <BillingSettingsPanel />
          </div>
        )}

      </main>
    </div>
  );
}
