/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    Download,
    Plus,
    TrendingUp,
    Ticket,
    Banknote,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    CheckCircle2,
    Lightbulb,
} from "lucide-react";

/* ───────────────────── mock data ───────────────────── */

const metrics = [
    {
        title: "ACTIVE CODES",
        value: "08",
        icon: <TrendingUp size={20} color="#27ae60" />,
        iconBg: "#e8f8ef",
    },
    {
        title: "TOTAL REDEMPTIONS",
        value: "1,248",
        icon: <Ticket size={20} color="#953002" />,
        iconBg: "#fef0e7",
    },
    {
        title: "REVENUE DRIVEN",
        value: "$14.2k",
        icon: <Banknote size={20} color="#953002" />,
        iconBg: "#fef0e7",
    },
];

const promotions = [
    {
        code: "EARLYBIRD25",
        discount: 25,
        periodDates: "Jan 01 - Mar 31",
        periodSub: "2024 Campaign",
        usageCurrent: 85,
        usageLimit: 100,
        status: "ACTIVE",
    },
    {
        code: "WINTERSTAY",
        discount: 15,
        periodDates: "Dec 01 - Jan 15",
        periodSub: "Yearly Winter",
        usageCurrent: 150,
        usageLimit: 150,
        status: "EXPIRED",
    },
    {
        code: "MARCH_MADNESS",
        discount: 40,
        periodDates: "Mar 01 - Mar 31",
        periodSub: "Seasonal Flash Sale",
        usageCurrent: 42,
        usageLimit: 500,
        status: "ACTIVE",
    },
    {
        code: "NEWHOST20",
        discount: 20,
        periodDates: "Ongoing",
        periodSub: "Welcome Pack",
        usageCurrent: 12,
        usageLimit: null, // infinite
        status: "ACTIVE",
    },
];

/* ───────────────────── component ───────────────────── */

export default function DiscountPage() {
    const [promoName, setPromoName] = useState("SUMMER2024");
    const [percentage, setPercentage] = useState("15");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [usageLimit, setUsageLimit] = useState("100");

    return (
        <div className="flex flex-col h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Top Bar ── */}
            <header className="flex items-center justify-between py-3 px-8 bg-white border-b border-[#e8e8e8] shrink-0">
                <Logo width={120} height={36} />
                <div className="flex items-center gap-3.5">
                    <a
                        href="/owner/ownerDashboard/message"
                        className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors"
                    >
                        <Bell size={18} color="#4f4f4f" />
                    </a>
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner"
                            alt="User"
                            className="w-full h-full rounded-full"
                        />
                    </div>
                </div>
            </header>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-8 py-5 font-sans">
                <div className="w-full pb-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-[11px] font-bold tracking-[0.8px] uppercase mb-4">
                        <a
                            href="/owner/rate"
                            className="text-[#828282] no-underline hover:text-[#953002] transition-colors"
                        >
                            Rate & Price
                        </a>
                        <span className="text-[#d0d0d0]">›</span>
                        <span className="text-[#953002]">Discount Management</span>
                    </nav>

                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-[22px] font-bold text-[#1d1d1d] m-0 mb-1 leading-tight tracking-wide">
                                Discount Management
                            </h1>
                            <p className="text-[13px] text-[#828282] m-0">
                                Create, track, and optimize discount codes for your rental properties.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 py-2 px-4.5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-xl text-[13px] font-bold cursor-pointer hover:bg-[#f5f5f5] transition-colors shadow-sm">
                                <Download size={16} /> Export CSV
                            </button>
                            <button className="flex items-center gap-2 py-2 px-5 bg-[#953002] text-white border-none rounded-xl text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] transition-colors shadow-sm">
                                <Plus size={16} /> Launch Campaign
                            </button>
                        </div>
                    </div>

                    {/* ── Layout Grid Wrapper ── */}
                    <div className="grid grid-cols-[1fr_2.5fr] gap-6 items-start">
                        {/* ── Left Pane: Create Form ── */}
                        <div className="bg-[#fff9f7] border border-[#ffeadd] rounded-2xl overflow-hidden shadow-[0_5px_20px_-5px_rgba(149,48,2,0.08)] sticky top-0">
                            <div className="pt-6 px-6 pb-4 border-b border-[#ffeadd]">
                                <h2 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-1">
                                    Create Promo Code
                                </h2>
                                <p className="text-[12px] text-[#828282] m-0">
                                    Configure a new discount offer.
                                </p>
                            </div>
                            <div className="p-6 bg-white">
                                <div className="mb-4">
                                    <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                        Promo Code Name
                                    </label>
                                    <input
                                        type="text"
                                        value={promoName}
                                        onChange={(e) => setPromoName(e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                        placeholder="e.g. SUMMER2024"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                        Discount Percentage
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={percentage}
                                            onChange={(e) => setPercentage(e.target.value)}
                                            className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                            placeholder="15"
                                        />
                                        <span className="absolute right-4 top-1/2 mt-[-8px] text-[#953002] font-black text-[13px]">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[13px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[#953002] cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[13px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[#953002] cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">
                                        Total Usage Limit
                                    </label>
                                    <input
                                        type="text"
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.value)}
                                        className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                        placeholder="100"
                                    />
                                </div>

                                <a href="/owner/rate" className="no-underline w-full block">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#953002] hover:bg-[#b03a02] text-white border-none rounded-xl text-[13px] font-extrabold cursor-pointer transition-colors shadow-md">
                                        <CheckCircle2 size={16} /> Save Promotion
                                    </button>
                                </a>
                            </div>
                        </div>

                        {/* ── Right Pane: Dynamics ── */}
                        <div className="flex flex-col gap-6">
                            {/* ── Top Metrics ── */}
                            <div className="grid grid-cols-3 gap-5">
                                {metrics.map((m, i) => (
                                    <div key={i} className="bg-white border border-[#e8e8e8] rounded-2xl py-6 px-6 flex items-center gap-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                                        <div
                                            className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center"
                                            style={{ backgroundColor: m.iconBg }}
                                        >
                                            {m.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#828282] tracking-[1px] mb-0.5">
                                                {m.title}
                                            </div>
                                            <div className="text-[26px] font-black text-[#1d1d1d] leading-none tracking-tight">
                                                {m.value}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Active Promotions Table ── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center py-5 px-6 border-b border-[#e0e0e0]">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0">
                                    Active Promotions
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button className="bg-transparent border-none p-1.5 cursor-pointer rounded-lg text-[#828282] hover:bg-[#f5f5f5] hover:text-[#1d1d1d]">
                                        <Filter size={18} />
                                    </button>
                                    <button className="bg-transparent border-none p-1.5 cursor-pointer rounded-lg text-[#828282] hover:bg-[#f5f5f5] hover:text-[#1d1d1d]">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        {["Code", "Discount", "Validity Period", "Usage Status", "Status", ""].map((headerText, idx) => (
                                            <th
                                                key={idx}
                                                className="text-left py-2 px-3.5 text-[10px] font-bold tracking-wider text-[#828282] border-b border-[#e0e0e0] uppercase"
                                            >
                                                {headerText}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.map((p, i) => {
                                        let ratio = 0;
                                        if (p.usageLimit && p.usageLimit > 0) {
                                            ratio = (p.usageCurrent / p.usageLimit) * 100;
                                        }

                                        let progressColor = "#953002"; // Active Orange
                                        if (p.status === "EXPIRED") progressColor = "#b0b0b0";
                                        if (ratio >= 100) progressColor = "#953002"; // Full

                                        const isActive = p.status === "ACTIVE";

                                        return (
                                            <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                                                {/* Code */}
                                                <td className="py-3 px-3.5">
                                                    <div className="text-[13px] font-black text-[#1d1d1d] tracking-wide">
                                                        {p.code}
                                                    </div>
                                                </td>

                                                {/* Discount */}
                                                <td className="py-3 px-3.5 font-bold">
                                                    <span className="text-[14px] text-[#953002]">
                                                        {p.discount}%
                                                    </span>{" "}
                                                    <span className="text-[#b0b0b0] text-[10px] ml-0.5">
                                                        OFF
                                                    </span>
                                                </td>

                                                {/* Validity */}
                                                <td className="py-3 px-3.5">
                                                    <div className="text-[12px] font-bold text-[#1d1d1d]">
                                                        {p.periodDates}
                                                    </div>
                                                    <div className="text-[11px] text-[#b0b0b0] mt-0.5 max-w-[130px] leading-tight flex flex-wrap">
                                                        {p.periodSub}
                                                    </div>
                                                </td>

                                                {/* Usage */}
                                                <td className="py-3 px-3.5 w-[140px]">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[11px] font-bold text-[#4f4f4f]">
                                                            {p.usageCurrent} /{" "}
                                                            {p.usageLimit === null ? "∞" : p.usageLimit}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-[#b0b0b0] bg-white">
                                                            {p.usageLimit === null
                                                                ? "Inf."
                                                                : ratio >= 100
                                                                ? "Full"
                                                                : `${Math.round(ratio)}%`}
                                                        </span>
                                                    </div>
                                                    {/* Progress bar */}
                                                    <div className="w-full h-[3px] bg-[#f0f0f0] rounded-full overflow-hidden">
                                                        {p.usageLimit !== null && (
                                                            <div
                                                                className="h-full rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.min(ratio, 100)}%`,
                                                                    backgroundColor: progressColor,
                                                                }}
                                                            />
                                                        )}
                                                        {p.usageLimit === null && (
                                                            <div
                                                                className="h-full rounded-full w-full"
                                                                style={{ backgroundColor: "#953002", opacity: 0.15 }}
                                                            />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-3.5">
                                                    <span
                                                        className={`inline-flex py-1 px-3 rounded-md text-[10px] font-black tracking-wider border ${
                                                            isActive
                                                                ? "bg-[#e8f8ef] text-[#27ae60] border-transparent"
                                                                : "bg-[#f5f5f5] text-[#828282] border-[#e0e0e0]"
                                                        }`}
                                                    >
                                                        {p.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-3.5 text-right w-[90px]">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button className="bg-transparent border-none p-1.5 cursor-pointer text-[#828282] hover:bg-[#f5f5f5] hover:text-[#953002] rounded transition-colors">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="bg-transparent border-none p-1.5 cursor-pointer text-[#828282] hover:bg-[#f5f5f5] hover:text-[#e74c3c] rounded transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination (Footer) */}
                            <div className="flex items-center justify-between py-4 px-6 border-t border-[#f0f0f0]">
                                <span className="text-[12px] text-[#b0b0b0] font-medium">
                                    Showing 1 to 4 of 12 promotions
                                </span>
                                <div className="flex gap-2">
                                    <button className="py-1.5 px-4 bg-white border border-[#e0e0e0] text-[#828282] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#f5f5f5] hover:text-[#1d1d1d] transition-colors">
                                        Previous
                                    </button>
                                    <button className="py-1.5 px-4 bg-white border border-[#e0e0e0] text-[#4f4f4f] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                    {/* ── Banner: Promotion Pro-Tip ── */}
                    <div className="mt-8 bg-[#fef5ef] border border-[#fbdcd0] rounded-2xl py-6 px-8 flex items-start gap-4">
                        <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Lightbulb size={20} color="#953002" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-bold text-[#1d1d1d] m-0 mb-1">
                                Promotion Pro-Tip
                            </h4>
                            <p className="text-[13px] text-[#828282] m-0 leading-relaxed max-w-[700px]">
                                Codes with 20% or higher discount see a 40% increase in conversion rates during the off-season. Consider scheduling &quot;FLASH&quot; codes with a 24-hour validity for peak engagement.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
