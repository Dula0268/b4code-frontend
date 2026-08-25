/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
        Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * ChangePasswordPage Component
 *
 * Secure form for changing the owner account password, requiring
 * current password verification and new password confirmation.
 */
export default function ChangePasswordPage() {
    const router = useRouter();
    const { user, updatePassword } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || newPassword !== confirmPassword || strength.length < 2) return;
        setSaving(true);
        setSaveError(null);
        try {
            await updatePassword(user?.email ?? "", currentPassword, newPassword);
            setSaved(true);
            setTimeout(() => router.push("/owner/setting/accountSetting"), 1000);
        } catch (err: any) {
            setSaveError(err?.message ?? "Failed to update password.");
        } finally {
            setSaving(false);
        }
    };



    const settingsTabs = [
        { label: "Account Settings", icon: <Shield size={16} />, href: "/owner/setting/accountSetting", active: true },
        // other tabs omitted for sub-page focus
    ];

    // Password strength check (basic mock)
    const getStrength = (pass: string) => {
        if (!pass) return { length: 0, text: "Too Weak", color: "bg-[#e0e0e0]" };
        if (pass.length < 6) return { length: 1, text: "Weak", color: "bg-[#eb5757]" };
        if (pass.length < 10) return { length: 2, text: "Fair", color: "bg-[#f2c94c]" };
        return { length: 3, text: "Strong", color: "bg-[#27ae60]" };
    };

    const strength = getStrength(newPassword);

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1 gap-2">
                        <a href="/owner/setting/accountSetting" className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-[#e0e0e0] cursor-pointer hover:bg-[#f5f5f5] text-[#4f4f4f] transition-all duration-150">
                            <ArrowLeft size={12} />
                        </a>
                        <div className="flex items-center">
                            <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#828282] no-underline hover:text-[#4f4f4f]">Settings</a>
                            <span className="text-[#b0b0b0] mx-1">/</span>
                            <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#828282] no-underline hover:text-[#4f4f4f]">Account Settings</a>
                            <span className="text-[#b0b0b0] mx-1">/</span>
                            <span className="text-[12px] font-semibold text-[var(--brand-primary)]">Change Password</span>
                        </div>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 mt-3">Change Password</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-6">Ensure your account uses a long, random password to stay secure.</p>

                    {/* Centered Form */}
                    <div className="max-w-[500px] mx-auto mt-8">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-6 px-7">
                            
                            <div className="flex flex-col gap-5">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-[12px] font-bold text-[#4f4f4f] mb-1.5">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showCurrent ? "text" : "password"} 
                                            value={currentPassword} 
                                            onChange={(e) => setCurrentPassword(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border pr-10 focus:border-[var(--brand-primary)] transition-colors" 
                                            placeholder="Enter your current password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer flex items-center justify-center p-0 text-[#828282] hover:text-[#4f4f4f]"
                                        >
                                            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[#f5f5f5]" />

                                {/* New Password */}
                                <div>
                                    <label className="block text-[12px] font-bold text-[#4f4f4f] mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNew ? "text" : "password"} 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border pr-10 focus:border-[var(--brand-primary)] transition-colors" 
                                            placeholder="Enter your new password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer flex items-center justify-center p-0 text-[#828282] hover:text-[#4f4f4f]"
                                        >
                                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <div className="flex-1 flex gap-1 h-1.5">
                                            <div className={`flex-1 rounded-full transition-colors duration-300 ${strength.length >= 1 ? strength.color : "bg-[#f5f5f5]"}`} />
                                            <div className={`flex-1 rounded-full transition-colors duration-300 ${strength.length >= 2 ? strength.color : "bg-[#f5f5f5]"}`} />
                                            <div className={`flex-1 rounded-full transition-colors duration-300 ${strength.length >= 3 ? strength.color : "bg-[#f5f5f5]"}`} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wider" style={{ color: strength.length > 0 ? strength.color.replace('bg-[', '').replace(']', '') : '#b0b0b0' }}>
                                            {strength.text.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Password Rules */}
                                    <ul className="mt-3 m-0 pl-1 list-none flex flex-col gap-1.5">
                                        <li className="flex items-center gap-1.5 text-[11px] text-[#828282]">
                                            <CheckCircle2 size={12} color={newPassword.length >= 8 ? "#27ae60" : "#d0d0d0"} />
                                            <span className={newPassword.length >= 8 ? "text-[#1d1d1d]" : ""}>At least 8 characters long</span>
                                        </li>
                                        <li className="flex items-center gap-1.5 text-[11px] text-[#828282]">
                                            <CheckCircle2 size={12} color={/[A-Z]/.test(newPassword) ? "#27ae60" : "#d0d0d0"} />
                                            <span className={/[A-Z]/.test(newPassword) ? "text-[#1d1d1d]" : ""}>Contains at least one uppercase letter</span>
                                        </li>
                                        <li className="flex items-center gap-1.5 text-[11px] text-[#828282]">
                                            <CheckCircle2 size={12} color={/[0-9]/.test(newPassword) ? "#27ae60" : "#d0d0d0"} />
                                            <span className={/[0-9]/.test(newPassword) ? "text-[#1d1d1d]" : ""}>Contains at least one number</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-[12px] font-bold text-[#4f4f4f] mb-1.5">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirm ? "text" : "password"} 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            className={`w-full py-2.5 px-3 border rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border pr-10 transition-colors ${
                                                confirmPassword && confirmPassword !== newPassword 
                                                    ? "border-[#eb5757] focus:border-[#eb5757] bg-[#fffcfc]" 
                                                    : "border-[#e0e0e0] focus:border-[var(--brand-primary)]"
                                            }`}
                                            placeholder="Confirm your new password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer flex items-center justify-center p-0 text-[#828282] hover:text-[#4f4f4f]"
                                        >
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <div className="text-[11px] text-[#eb5757] mt-1.5">Passwords do not match.</div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Bottom Actions */}
                        {saveError && <div className="text-[12px] text-[#eb5757] pt-3">{saveError}</div>}
                        {saved && <div className="text-[12px] text-[#27ae60] pt-3">Password updated successfully.</div>}
                        <div className="flex gap-3 pt-5">
                            <a href="/owner/setting/accountSetting" className="no-underline">
                                <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                    Cancel
                                </button>
                            </a>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword || strength.length < 2}
                                className={`py-2.5 px-6 text-white border-none rounded-lg text-[13px] font-bold cursor-pointer transition-colors ${
                                    saving || !currentPassword || !newPassword || newPassword !== confirmPassword || strength.length < 2
                                        ? "bg-[#d0d0d0] pointer-events-none"
                                        : "bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)]"
                                }`}
                            >
                                {saving ? "Updating…" : "Update Password"}
                            </button>
                        </div>
                    </div>

                </div>
            </main>
    );
}
