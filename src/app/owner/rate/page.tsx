/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { propertiesApi } from "@/api/owner/properties.api";
import { ratesApi } from "@/api/owner/rates.api";
import {
    Bell,
    TrendingUp,
    TrendingDown,
    Edit,
    Plus,
    CheckCircle,
    Gift,
    Clock,
    CalendarRange,
} from "lucide-react";


/* ───────────────────── component ───────────────────── */

/**
 * RatePage Component
 * 
 * Main dashboard for the Rate module. Allows property owners to configure
 * base prices, active discounts, and seasonal/weekend modifiers.
 */
export default function RatePage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [weekendFri, setWeekendFri] = useState(true);
    const [weekendSun, setWeekendSun] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [roomPrices, setRoomPrices] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [discounts, setDiscounts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [seasons, setSeasons] = useState<any[]>([]);
    const [kpis, setKpis] = useState({ averageRate: "—", occupancyForecast: "—", activeDiscountCount: 0 });

    useEffect(() => {
        const loadRates = async () => {
            try {
                const propData = await propertiesApi.listProperties(ownerId, 1, 1);
                const firstProp = propData.properties?.[0];
                if (!firstProp) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = await ratesApi.getRateOverview(firstProp.id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setRoomPrices((data.ratePlans || []).map((p: any) => ({
                    type: p.roomType || "—",
                    base: p.basePrice?.toString() || "0",
                    weekend: p.weekendPercentage || "+0%",
                    status: p.status === "ACTIVE" ? "Active" : p.status === "DRAFT" ? "Draft" : (p.status || "—"),
                })));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setDiscounts((data.discounts || []).map((d: any) => ({
                    name: d.name || "—",
                    desc: d.description || "",
                    pct: d.percentage || "0%",
                    icon: d.discountType === "EARLY_BIRD" ? "gift" : "clock",
                    active: !!d.active,
                })));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSeasons((data.seasonalPricing || []).map((s: any) => ({
                    name: s.name || "—",
                    range: s.dateRange || "—",
                    pct: s.percentage || "0%",
                    progress: s.progress || 0,
                })));
                setKpis({
                    averageRate: data.averageNightlyRate != null ? `Rs ${Number(data.averageNightlyRate).toLocaleString()}` : "—",
                    occupancyForecast: data.occupancyForecast != null ? `${data.occupancyForecast}%` : "—",
                    activeDiscountCount: data.activeDiscountCount || 0,
                });
                if (data.weekendMultiplier) {
                    setWeekendFri(!!data.weekendMultiplier.fridaySaturday);
                    setWeekendSun(!!data.weekendMultiplier.sundayNight);
                }
            } catch (err) {
                console.error("Failed to load rates:", err);
            }
        };
        loadRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId]);

    return (
        <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
                {/* Scrollable body */}
                <div className="w-full flex-1 overflow-y-auto px-8 pt-6 pb-10">
                    {/* ── KPI Cards ── */}
                    <div className="w-full grid grid-cols-3 gap-4 mb-5">
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4.5 px-5.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Average Nightly Rate</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">{kpis.averageRate}</span>
                                <span className="text-[12px] font-semibold text-[#27ae60] flex items-center gap-1"><TrendingUp size={12} /></span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4.5 px-5.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Occupancy Forecast</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">{kpis.occupancyForecast}</span>
                                <span className="text-[12px] font-semibold text-[#eb5757] flex items-center gap-1"><TrendingDown size={12} /> 2.1%</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4.5 px-5.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Active Discounts</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">{kpis.activeDiscountCount} Rules</span>
                                <span className="text-[12px] text-[#27ae60] font-semibold flex items-center gap-1">
                                    <CheckCircle size={12} /> Optimized
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="w-full grid grid-cols-[1fr_300px] gap-5 items-start">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4.5">
                            {/* Room Base Prices */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0">Room Base Prices</h3>
                                    <button className="flex items-center gap-1 bg-transparent border-none text-[var(--brand-primary)] text-[12px] font-semibold cursor-pointer">
                                        <Plus size={14} /> Add Room Type
                                    </button>
                                </div>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-left border-b border-[#e8e8e8]">ROOM TYPE</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">BASE PRICE (Rs)</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">WEEKEND %</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">STATUS</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomPrices.map((r, i) => (
                                            <tr key={i} className="border-b border-[#f5f5f5]">
                                                <td className="py-3.5 px-3 text-[13px] text-[#4f4f4f]">
                                                    <span className="font-semibold text-[#1d1d1d]">{r.type}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-[15px] text-[#4f4f4f] text-center font-bold">
                                                    {r.base}
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center font-semibold text-[var(--brand-primary)]">
                                                    {r.weekend}
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center">
                                                    <span className={`text-[11px] font-semibold py-1 px-3 rounded-full inline-block ${
                                                        r.status === "Active" ? "text-[#27ae60] bg-[#e8f5e9]" : "text-[#828282] bg-[#f5f5f5]"
                                                    }`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center">
                                                    <button className="bg-transparent border-none cursor-pointer p-1">
                                                        <Edit size={15} color="#828282" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Special Discounts */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0">Special Discounts</h3>
                                    <a href="/owner/rate/discount" className="no-underline">
                                        <button className="py-2 px-4.5 bg-[var(--brand-primary)] text-white border-none rounded-full text-[10px] font-bold cursor-pointer tracking-wider hover:bg-[var(--primary-hover)] transition-colors">CREATE NEW DISCOUNT</button>
                                    </a>
                                </div>
                                <div className="grid grid-cols-2 gap-3.5">
                                    {discounts.map((d, i) => (
                                        <div key={i} className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                                    {d.icon === "gift" ? <Gift size={20} color="#953002" /> : <Clock size={20} color="#953002" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[14px] font-bold text-[#1d1d1d]">{d.name}</span>
                                                        <span className="text-[14px] font-bold text-[var(--brand-primary)]">{d.pct}</span>
                                                    </div>
                                                    <div className="text-[11px] text-[#828282] mt-1 leading-relaxed">{d.desc}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" />
                                                    <span className="text-[10px] font-bold text-[#27ae60] tracking-wider">ACTIVE</span>
                                                </span>
                                                <a href="/owner/rate/discount" className="no-underline">
                                                    <button className="bg-transparent border-none text-[#828282] text-[12px] font-medium cursor-pointer hover:text-[#1d1d1d] hover:font-semibold transition-colors">Configure</button>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-3.5">
                            {/* Seasonal Pricing */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <h4 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-4">Seasonal Pricing</h4>
                                {seasons.map((sn, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[14px] font-bold text-[#1d1d1d]">{sn.name}</span>
                                            <span className={`text-[14px] font-bold ${sn.pct.startsWith("+") ? "text-[#27ae60]" : "text-[#eb5757]"}`}>{sn.pct}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <CalendarRange size={12} color="#b0b0b0" />
                                            <span className="text-[11px] text-[#828282]">{sn.range}</span>
                                        </div>
                                        <div className="h-1.5 bg-[#e8e8e8] rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-[var(--brand-primary)] rounded-full" style={{ width: `${sn.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-[var(--brand-primary)] rounded-lg bg-transparent text-[var(--brand-primary)] text-[13px] font-semibold cursor-pointer mt-1">
                                    <CalendarRange size={14} color="#953002" /> Add Seasonal Range
                                </button>
                            </div>

                            {/* Weekend Multipliers */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <h4 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-4">Weekend Multipliers</h4>
                                {/* Friday & Saturday */}
                                <div className="flex justify-between items-center py-3 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">Friday & Saturday</div>
                                        <div className="text-[11px] text-[#828282]">Standard surcharge</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">15%</span>
                                        <button
                                            onClick={() => setWeekendFri(!weekendFri)}
                                            className={`w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200 ${
                                                weekendFri ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"
                                            }`}
                                        >
                                            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                                {/* Sunday Night */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">Sunday Night</div>
                                        <div className="text-[11px] text-[#828282]">Off-peak adjustment</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">0%</span>
                                        <button
                                            onClick={() => setWeekendSun(!weekendSun)}
                                            className={`w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200 ${
                                                weekendSun ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"
                                            }`}
                                        >
                                            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
