/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    Tag,
    BookOpen,
    Settings,
    User,
    Home,
    BellRing,
    CreditCard,
    Puzzle,
    Landmark,
    Download,
} from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import { paymentApi } from "@/api/payment/payment.api";

/* ───────────────────── component ───────────────────── */

/**
 * BillingPayoutPage Component
 *
 * Overview of billing history and payout transactions, including
 * linked bank accounts, pending payouts, and transaction records.
 */
export default function BillingPayoutPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId;

    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [requesting, setRequesting] = useState(false);
    const [hasActivePayout, setHasActivePayout] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);

    useEffect(() => {
        if (!ownerId) {
            setBankAccounts([]);
            return;
        }

        ownerSettingsApi.getBankAccounts(ownerId)
            .then((data: any[]) => setBankAccounts(data || []))
            .catch(() => {});
    }, [ownerId]);

    useEffect(() => {
        paymentApi.getMyPayments()
            .then((data: any[]) => setInvoices(data || []))
            .catch(() => {});
    }, []);

    const primaryAccount = bankAccounts.find((a) => a.isPrimary) ?? bankAccounts[0] ?? null;
    const canRequestPayout = Boolean(ownerId) && Boolean(primaryAccount) && !hasActivePayout && !requesting;

    const handleRequestPayout = async () => {
        if (!ownerId || !primaryAccount || hasActivePayout) return;

        setRequesting(true);
        setRequestError(null);
        setRequestSuccess(null);
        try {
            await ownerSettingsApi.requestPayout(ownerId);
            setHasActivePayout(true);
            setRequestSuccess("Payout request submitted successfully! Pending Admin approval.");
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Failed to submit payout request.";
            setRequestError(message);
            if (message.toLowerCase().includes("already pending") || message.toLowerCase().includes("already processed") || message.toLowerCase().includes("pending or has already been processed")) {
                setHasActivePayout(true);
            }
        } finally {
            setRequesting(false);
        }
    };

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/owner/roomManagement" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Rate", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/accountSetting", active: true },
    ];

    const settingsTabs = [
        { label: "Account Settings", icon: <User size={16} />, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, href: "/owner/setting/propertySetting" },
        { label: "Notification Preferences", icon: <BellRing size={16} />, href: "/owner/setting/notificationPreferences" },
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, active: true, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, href: "/owner/setting/integration" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="px-4 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-4 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
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
                {/* Top Bar */}
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
                    <div className="flex items-center mb-1">
                        <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#4f4f4f] no-underline">Settings</a>
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <span className="text-[12px] font-semibold text-[#953002]">Billing & Payouts</span>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1">Settings</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-5">Manage your account preferences and property configurations.</p>

                    {/* Content Area */}
                    <div className="flex gap-6 items-start">
                        {/* Settings Tabs */}
                        <div className="w-[200px] shrink-0 flex flex-col gap-1">
                            {settingsTabs.map((tab) => (
                                <a
                                    key={tab.label}
                                    href={tab.href || "#"}
                                    className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline ${
                                        tab.active
                                            ? "bg-[#953002] text-white font-bold"
                                            : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </a>
                            ))}
                        </div>

                        {/* Main Panel */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            {/* ─── Billing & Payouts ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <div className="flex justify-between items-start mb-4.5">
                                    <div>
                                        <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Billing & Payouts</h3>
                                        <p className="text-[12px] text-[#828282] m-0">Manage bank details and view invoices.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleRequestPayout}
                                            disabled={!canRequestPayout}
                                            className={`text-[12px] font-bold py-1.5 px-3.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                                                !canRequestPayout
                                                    ? "bg-[#e0e0e0] text-[#828282] cursor-not-allowed"
                                                    : "bg-[#953002] text-white hover:bg-[#b03a02]"
                                            }`}
                                        >
                                            {requesting ? "Submitting..." : hasActivePayout ? "Payout In Progress" : "Request Payout"}
                                        </button>
                                        <a href="/owner/setting/accountSetting/addNewBankAccount" className="no-underline">
                                            <button className="bg-white border border-[#e0e0e0] text-[#1d1d1d] text-[12px] font-bold py-1.5 px-3 rounded-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors whitespace-nowrap">
                                                Add New Bank Account
                                            </button>
                                        </a>
                                    </div>
                                </div>

                                {hasActivePayout && !requestSuccess && (
                                    <div className="mb-4 text-[12px] font-semibold text-[#b45309] bg-[#fff7ed] border border-[#fed7aa] py-2 px-3 rounded-lg">
                                        A payout request is already pending or has already been processed. Please wait before requesting another payout.
                                    </div>
                                )}

                                {requestSuccess && (
                                    <div className="mb-4 text-[12px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] py-2 px-3 rounded-lg">
                                        {requestSuccess}
                                    </div>
                                )}

                                {requestError && (
                                    <div className="mb-4 text-[12px] font-semibold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] py-2 px-3 rounded-lg">
                                        {requestError}
                                    </div>
                                )}

                                {primaryAccount ? (
                                    <div className="flex justify-between items-center bg-[#fef5ef] rounded-[10px] py-3.5 px-4.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                                                <Landmark size={18} color="#953002" />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold text-[#1d1d1d]">
                                                    {primaryAccount.bankName} **** {String(primaryAccount.accountNumber).slice(-4)}
                                                </div>
                                                <div className="text-[11px] text-[#828282]">
                                                    {primaryAccount.isPrimary ? "Primary Payout Method" : "Bank Account"}
                                                </div>
                                            </div>
                                        </div>
                                        <a href="/owner/setting/accountSetting/Billing&Payout" className="bg-transparent border-none text-[12px] font-semibold text-[#953002] cursor-pointer p-0 no-underline hover:underline">Edit</a>
                                    </div>
                                ) : (
                                    <div className="text-[12px] text-[#828282] py-3 text-center">No bank account added yet.</div>
                                )}

                                <div className="mt-4">
                                    <div className="text-[13px] font-bold text-[#1d1d1d] mb-2.5">Recent Invoices</div>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="text-[10px] font-semibold text-[#828282] py-2 px-2 text-left border-b border-[#f0f0f0]">Date</th>
                                                <th className="text-[10px] font-semibold text-[#828282] py-2 px-2 text-left border-b border-[#f0f0f0]">Amount</th>
                                                <th className="text-[10px] font-semibold text-[#828282] py-2 px-2 text-left border-b border-[#f0f0f0]">Status</th>
                                                <th className="text-[10px] font-semibold text-[#828282] py-2 px-2 text-left border-b border-[#f0f0f0]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-[12px] text-[#828282] py-4 px-2 text-center">No invoices found.</td>
                                                </tr>
                                            ) : (
                                                invoices.map((inv: any) => {
                                                    const date = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "—";
                                                    const amount = inv.amount != null ? `${inv.currency ?? "Rs"} ${Number(inv.amount).toFixed(2)}` : "—";
                                                    const status = inv.status ? inv.status.charAt(0) + inv.status.slice(1).toLowerCase() : "—";
                                                    const isPaid = inv.status === "PAID" || inv.status === "SUCCESS";
                                                    return (
                                                        <tr key={inv.id}>
                                                            <td className="text-[12px] text-[#4f4f4f] py-2.5 px-2 border-b border-[#f5f5f5]">{date}</td>
                                                            <td className="text-[12px] text-[#4f4f4f] py-2.5 px-2 border-b border-[#f5f5f5]">{amount}</td>
                                                            <td className="py-2.5 px-2 border-b border-[#f5f5f5]">
                                                                <span className={`text-[11px] font-bold ${isPaid ? "text-[#27ae60]" : "text-[#e67e22]"}`}>{status}</span>
                                                            </td>
                                                            <td className="py-2.5 px-2 border-b border-[#f5f5f5]">
                                                                <button className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 hover:bg-[#f5f5f5] rounded transition-colors">
                                                                    <Download size={14} color="#828282" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
