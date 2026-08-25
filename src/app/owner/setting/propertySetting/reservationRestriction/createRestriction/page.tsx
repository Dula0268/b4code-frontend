/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import { propertiesApi } from "@/api/owner/properties.api";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import {
        ArrowLeft,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ShieldCheck,
    SlidersHorizontal,
    Lightbulb,
    Minus,
    Plus,
    ExternalLink,
    Save,
} from "lucide-react";

const RULE_TYPE_MAP: Record<string, string> = {
    "Minimum Length of Stay": "MIN_STAY",
    "Maximum Length of Stay": "MAX_STAY",
    "Closed to Arrival": "CLOSED_TO_ARRIVAL",
    "Closed to Departure": "CLOSED_TO_DEPARTURE",
    "Advance Booking Required": "ADVANCE_NOTICE",
};

/* ───────────────────── component ───────────────────── */

/**
 * CreateRestrictionPage Component
 *
 * Form for creating a new reservation restriction rule with
 * configurable type, date range, room type scope, and thresholds.
 */
export default function CreateRestrictionPage() {
    const [ruleCategory, setRuleCategory] = useState("Minimum Length of Stay");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minNights, setMinNights] = useState(2);
    const [maxNights, setMaxNights] = useState(30);
    const [advanceNotice, setAdvanceNotice] = useState("");
    const [advanceUnit, setAdvanceUnit] = useState("Days");
    const [propertyId, setPropertyId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const router = useRouter();
    const ownerId = user?.userId ?? 1;

    useEffect(() => {
        propertiesApi.listProperties(ownerId, 1, 100)
            .then((list: any[]) => { if (list.length) setPropertyId(list[0].id); })
            .catch(() => {});
    }, [ownerId]);

    const handleSaveRestriction = async () => {
        if (!propertyId) {
            setSaveError("No property found.");
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            await ownerSettingsApi.createRestriction({
                propertyId,
                name: ruleCategory,
                type: RULE_TYPE_MAP[ruleCategory] || "OTHER",
                startDate: startDate || null,
                endDate: endDate || null,
                reason: `Min: ${minNights}, Max: ${maxNights}${advanceNotice ? `, Advance: ${advanceNotice} ${advanceUnit}` : ""}`,
                isActive: true,
            });
            router.push("/owner/setting/propertySetting/reservationRestriction");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSaveError((err as any)?.response?.data?.message ?? "Failed to save restriction.");
        } finally {
            setSaving(false);
        }
    };



    /* Calendar mock */
    const calDays = [
        { d: 29, dim: true }, { d: 30, dim: true },
        { d: 1 }, { d: 2 }, { d: 3 }, { d: 4, sel: "range" }, { d: 5, sel: "range" },
        { d: 6, sel: "range" }, { d: 7, sel: "range" }, { d: 8, sel: "active" }, { d: 9 },
    ];

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Back Link */}
                    <a href="/owner/setting/propertySetting/reservationRestriction" className="inline-flex items-center gap-1.5 text-[12px] text-[#4f4f4f] no-underline font-semibold mb-2">
                        <ArrowLeft size={14} /> Back to Restrictions List
                    </a>

                    <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-5">Create New Restriction</h1>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-[3fr_2fr] gap-5 items-start">
                        {/* ─── Left Column ─── */}
                        <div className="flex flex-col gap-4">
                            {/* Restriction Type */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <ShieldCheck size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Restriction Type</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Choose the rule you want to apply to your property.</p>

                                <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Rule Category</label>
                                <div className="relative">
                                    <select value={ruleCategory} onChange={(e) => setRuleCategory(e.target.value)} className="w-full py-2.5 pr-9 pl-3.5 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                        <option>Minimum Length of Stay</option>
                                        <option>Maximum Length of Stay</option>
                                        <option>Closed to Arrival</option>
                                        <option>Closed to Departure</option>
                                        <option>Advance Booking Required</option>
                                    </select>
                                    <ChevronDown size={14} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Effective Dates */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <CalendarDays size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Effective Dates</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Select the date range when this restriction will be active.</p>

                                {/* Date Inputs */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Start Date</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <CalendarDays size={14} color="#828282" />
                                            <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="mm/dd/yyyy" className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">End Date</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <CalendarDays size={14} color="#828282" />
                                            <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="mm/dd/yyyy" className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Calendar */}
                                <div className="bg-[#fafafa] rounded-xl p-4 px-4.5 mt-3.5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">October 2023</span>
                                        <div className="flex gap-1.5">
                                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronLeft size={14} color="#b0b0b0" /></button>
                                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronRight size={14} color="#b0b0b0" /></button>
                                        </div>
                                    </div>
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((h) => (
                                            <div key={h} className="text-[11px] font-semibold text-[#828282] text-center py-1.5">{h}</div>
                                        ))}
                                    </div>
                                    {/* Day Cells */}
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {calDays.map((day, i) => (
                                            <div key={i} className="flex items-center justify-center py-0.5">
                                                <span
                                                    className="w-7.5 h-7.5 flex items-center justify-center rounded-md text-[12px] cursor-pointer transition-all duration-150"
                                                    style={{
                                                        color: day.dim ? "#d0d0d0" : day.sel === "active" ? "#fff" : day.sel === "range" ? "#fff" : "#1d1d1d",
                                                        background: day.sel === "active" ? "#953002" : day.sel === "range" ? "#e07540" : "transparent",
                                                        fontWeight: day.sel ? 700 : 500,
                                                    }}
                                                >
                                                    {day.d}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <SlidersHorizontal size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Settings</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Define the specific parameters for this restriction.</p>

                                {/* Minimum Nights */}
                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Minimum Nights</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">Guests must book at least this many nights.</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setMinNights(Math.max(1, minNights - 1))} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Minus size={14} /></button>
                                        <input type="text" value={minNights} onChange={(e) => setMinNights(Number(e.target.value) || 0)} className="w-[50px] py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <button onClick={() => setMinNights(minNights + 1)} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Plus size={14} /></button>
                                        <span className="text-[13px] text-[#828282] ml-1">nights</span>
                                    </div>
                                </div>

                                {/* Maximum Nights */}
                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Maximum Nights</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">Maximum allowed stay duration.</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setMaxNights(Math.max(1, maxNights - 1))} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Minus size={14} /></button>
                                        <input type="text" value={maxNights} onChange={(e) => setMaxNights(Number(e.target.value) || 0)} className="w-[50px] py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <button onClick={() => setMaxNights(maxNights + 1)} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Plus size={14} /></button>
                                        <span className="text-[13px] text-[#828282] ml-1">nights</span>
                                    </div>
                                </div>

                                {/* Advance Notice */}
                                <div className="flex justify-between items-center py-3.5">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Advance Notice</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">How far in advance must guests book?</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <input type="text" value={advanceNotice} onChange={(e) => setAdvanceNotice(e.target.value)} placeholder="e.g. 2" className="w-20 py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <div className="relative">
                                            <select value={advanceUnit} onChange={(e) => setAdvanceUnit(e.target.value)} className="py-1.5 pr-6 pl-2.5 border border-[#e0e0e0] rounded-md text-[12px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer">
                                                <option>Days</option>
                                                <option>Hours</option>
                                                <option>Weeks</option>
                                            </select>
                                            <ChevronDown size={12} color="#828282" className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            {saveError && (
                                <div className="text-[12px] text-[#c0392b] font-medium text-center">{saveError}</div>
                            )}
                            <div className="flex justify-center gap-3 mt-1 pt-2">
                                <a href="/owner/setting/propertySetting/reservationRestriction" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel</button>
                                </a>
                                <button
                                    onClick={handleSaveRestriction}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={14} /> {saving ? "Saving…" : "Save Restriction"}
                                </button>
                            </div>
                        </div>

                        {/* ─── Right Column ─── */}
                        <div className="flex flex-col gap-4">
                            {/* Revenue Tips */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Lightbulb size={16} color="#953002" />
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Revenue Tips</h3>
                                </div>

                                <div className="mb-4">
                                    <div className="text-[13px] font-bold text-[#1d1d1d] mb-1">Why use Minimum Nights?</div>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed m-0">
                                        Setting a 2-3 night minimum during weekends or high season helps reduce turnover costs and maximizes revenue per booking.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <div className="text-[13px] font-bold text-[#1d1d1d] mb-1">Managing Gaps</div>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed m-0">
                                        Use &quot;Maximum Nights&quot; to prevent long-term tenants if you prefer short-term vacationers, or to comply with local regulations.
                                    </p>
                                </div>

                                <div className="bg-[#fef8f4] border border-[#fce8d8] rounded-xl p-3 px-3.5 mb-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                                        <span className="text-[11px] font-extrabold text-[var(--brand-primary)] tracking-[0.5px]">PRO TIP</span>
                                    </div>
                                    <p className="text-[11px] text-[#4f4f4f] leading-snug m-0">
                                        Last-minute gaps can be filled by removing &quot;Advance Notice&quot; restrictions 24 hours before the date.
                                    </p>
                                </div>

                            </div>

                            {/* Promo Image */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
                                    alt="Smart restrictions"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <p className="text-[11px] text-[#828282] m-0 mt-2.5 leading-snug">
                                    &quot;Smart restrictions can increase occupancy by up to 15%.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
    );
}
