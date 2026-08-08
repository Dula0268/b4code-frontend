/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import {
    Bell,
    LayoutDashboard,
    Building2,
    Tag,
    BookOpen,
    Settings,
    ArrowLeft,
    Landmark,
    Loader2,
    Users,
    Star,
    MessageSquare,
} from "lucide-react";

export default function EditBankDetailsPage() {
    const router = useRouter();
    const [bankName, setBankName] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [branchName, setBranchName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        ownerSettingsApi.getOwnerBankDetails()
            .then((data) => {
                setBankName(data.bankName ?? "");
                setAccountHolder(data.accountHolderName ?? "");
                setAccountNumber(data.accountNumber ?? "");
                setBranchName(data.branchName ?? "");
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            await ownerSettingsApi.saveOwnerBankDetails({
                bankName,
                accountHolderName: accountHolder,
                accountNumber,
                branchName,
            });
            setSaveSuccess(true);
            setTimeout(() => router.push("/owner/setting/accountSetting"), 1000);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setSaveError(e?.response?.data?.message ?? "Failed to save bank details.");
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { label: "Dashboard",  icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />,       href: "/owner/properties" },
        { label: "Staff",      icon: <Users size={18} />,           href: "/owner/staff" },
        { label: "Reviews",    icon: <Star size={18} />,            href: "/owner/reviews" },
        { label: "Messages",   icon: <MessageSquare size={18} />,   href: "/owner/message" },
        { label: "Settings",   icon: <Settings size={18} />,        href: "/owner/setting/accountSetting", active: true },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="flex items-center gap-1.5 px-3.5 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-3.5 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
                                item.active
                                    ? "bg-[rgba(149,48,2,0.08)] text-[#953002] font-bold border-[#953002]"
                                    : "bg-transparent text-[#4f4f4f] font-medium border-transparent"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
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
                            <span className="text-[12px] font-semibold text-[#953002]">Edit Bank Details</span>
                        </div>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 mt-3">Edit Bank Details</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-6">Update your payout account information securely.</p>

                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 size={24} className="animate-spin text-[#953002]" />
                        </div>
                    ) : (
                        <div className="max-w-[500px] mx-auto mt-8">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-6 px-7">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f5f5f5]">
                                    <div className="w-10 h-10 rounded-lg bg-[#fef5ef] flex items-center justify-center">
                                        <Landmark size={20} color="#953002" />
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">Current Payout Method</div>
                                        <div className="text-[12px] text-[#828282]">
                                            {bankName ? `${bankName}${accountNumber ? ` **** ${accountNumber.slice(-4)}` : ""}` : "No bank account set"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            placeholder="e.g. Bank of Ceylon"
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Account Holder Name</label>
                                        <input
                                            type="text"
                                            value={accountHolder}
                                            placeholder="Name on the account"
                                            onChange={(e) => setAccountHolder(e.target.value)}
                                            className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Account Number</label>
                                            <input
                                                type="text"
                                                value={accountNumber}
                                                placeholder="Account number"
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Branch Name</label>
                                            <input
                                                type="text"
                                                value={branchName}
                                                placeholder="e.g. Colombo Main"
                                                onChange={(e) => setBranchName(e.target.value)}
                                                className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {saveError && <div className="text-[12px] text-[#eb5757] pt-3">{saveError}</div>}
                            {saveSuccess && <div className="text-[12px] text-[#27ae60] pt-3">Bank details saved successfully.</div>}

                            {/* Bottom Actions */}
                            <div className="flex gap-3 pt-5">
                                <a href="/owner/setting/accountSetting" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                        Cancel
                                    </button>
                                </a>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || !bankName || !accountHolder || !accountNumber}
                                    className={`py-2.5 px-6 text-white border-none rounded-lg text-[13px] font-bold cursor-pointer transition-colors flex items-center gap-2 ${
                                        saving || !bankName || !accountHolder || !accountNumber
                                            ? "bg-[#d0d0d0] pointer-events-none"
                                            : "bg-[#953002] hover:bg-[#b03a02]"
                                    }`}
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
