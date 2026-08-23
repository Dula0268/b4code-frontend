/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import {
    Bell,
        ArrowLeft,
    Landmark
} from "lucide-react";

/**
 * AddNewBankAccountPage Component
 *
 * Form for adding a new bank account for payout disbursements,
 * including bank name, account number, SWIFT/BIC, and verification.
 */
export default function AddNewBankAccountPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const ownerId = user?.userId;
    const [bankName, setBankName] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [routingNumber, setRoutingNumber] = useState("");
    const [accountType, setAccountType] = useState("Checking");
    const [isPrimary, setIsPrimary] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!bankName || !accountHolder || !accountNumber || !routingNumber) return;
        setSaving(true);
        setSaveError(null);
        try {
            await ownerSettingsApi.addBankAccount(ownerId, {
                bankName,
                accountHolder: accountHolder,
                accountNumber,
                branchCode: routingNumber,
                isPrimary,
            });
            router.push("/owner/setting/billing&Payout");
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Failed to add bank account.";
            setSaveError(message);
        } finally {
            setSaving(false);
        }
    };



    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

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
                            <span className="text-[12px] font-semibold text-[var(--brand-primary)]">Add Bank Account</span>
                        </div>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 mt-3">Add New Bank Account</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-6">Enter details for the new bank account to receive payouts.</p>

                    {/* Centered Form */}
                    <div className="max-w-[500px] mx-auto mt-8">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-6 px-7">
                            <div className="flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Bank Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Bank of America"
                                            value={bankName} 
                                            onChange={(e) => setBankName(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Account Type</label>
                                        <select 
                                            value={accountType} 
                                            onChange={(e) => setAccountType(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[var(--brand-primary)] transition-colors"
                                        >
                                            <option value="Checking">Checking</option>
                                            <option value="Savings">Savings</option>
                                            <option value="Business Checking">Business Checking</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Account Holder Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Name on the account"
                                        value={accountHolder} 
                                        onChange={(e) => setAccountHolder(e.target.value)} 
                                        className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Routing Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="9-digit routing number"
                                            value={routingNumber} 
                                            onChange={(e) => setRoutingNumber(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Account Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="Account number"
                                            value={accountNumber} 
                                            onChange={(e) => setAccountNumber(e.target.value)} 
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors" 
                                        />
                                    </div>
                                </div>

                                {/* Set as primary payout */}
                                <div className="flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="primary-payout" 
                                        checked={isPrimary} 
                                        onChange={(e) => setIsPrimary(e.target.checked)}
                                        className="w-4 h-4 cursor-pointer accent-[#953002]"
                                    />
                                    <label htmlFor="primary-payout" className="text-[12px] font-medium text-[#4f4f4f] cursor-pointer">
                                        Set as primary payout method
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        {saveError && <div className="text-[12px] text-[#eb5757] pt-3">{saveError}</div>}
                        <div className="flex gap-3 pt-5">
                            <a href="/owner/setting/accountSetting" className="no-underline">
                                <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                    Cancel
                                </button>
                            </a>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !bankName || !accountHolder || !accountNumber || !routingNumber}
                                className={`py-2.5 px-6 text-white border-none rounded-lg text-[13px] font-bold cursor-pointer transition-colors ${
                                    saving || !bankName || !accountHolder || !accountNumber || !routingNumber
                                        ? "bg-[#d0d0d0] pointer-events-none"
                                        : "bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)]"
                                }`}
                            >
                                {saving ? "Adding…" : "Add Account"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
    );
}
