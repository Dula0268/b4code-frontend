"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";

export default function SecurityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { user, updatePassword } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const emailToUse = user?.email || "staff@primestay.com";
      await updatePassword(emailToUse, formData.currentPassword, formData.newPassword);
      setIsSaving(false);
      setShowModal(true);
    } catch (error) {
      setIsSaving(false);
      setErrorMsg(error instanceof Error ? error.message : "Failed to update password");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-10 max-w-3xl relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1c1917] mb-2">Login & Security</h1>
        <p className="text-[#78716c]">Update your password and manage your account security.</p>
      </div>

      <div className="bg-[#fdfaf8] border border-[#f3f4f6] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center text-[var(--brand-primary)]">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1c1917]">Update Password</h2>
            <p className="text-sm text-[#78716c]">Ensure your account is using a long, random password to stay secure.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="text-sm bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#44403c]">Current Password</label>
            <Input
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="h-11 bg-white border-[#e7e5e4] focus-visible:ring-[rgba(149,48,2,0.2)] max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#f3f4f6]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403c]">New Password</label>
              <Input
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="h-11 bg-white border-[#e7e5e4] focus-visible:ring-[rgba(149,48,2,0.2)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44403c]">Confirm New Password</label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 bg-white border-[#e7e5e4] focus-visible:ring-[rgba(149,48,2,0.2)]"
              />
            </div>
          </div>

          <div className="text-xs text-[#a8a29e] pt-2">
            Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
          </div>

          <div className="pt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white px-8 transition-colors h-11"
              disabled={isSaving || !formData.currentPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
            >
              {isSaving ? "Updating..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>

      {/* Password Reset Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6 text-green-500">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-xl font-bold text-[#1c1917] mb-2">
              Password Reset Successful!
            </h2>

            <p className="text-[#78716c] text-sm mb-8 leading-relaxed">
              Your password has been changed successfully. You can now use your new password to log in.
            </p>

            <Button
              className="w-full h-12 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-[15px] transition-colors"
              onClick={() => {
                setShowModal(false);
                router.push("/auth/login");
              }}
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
