/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { ratesApi } from "@/api/owner/rates.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Edit,
    Plus,
    Gift,
    Clock,
    CalendarRange,
    Trash2,
    X,
} from "lucide-react";

/* ── types ── */
interface DiscountItem {
    id: number;
    name: string;
    desc: string;
    pct: string;
    type: string;
    icon: "gift" | "clock";
    active: boolean;
    minNights?: number;
    daysInAdvance?: number;
    startDate?: string;
    endDate?: string;
}

interface SeasonItem {
    id: number;
    name: string;
    range: string;
    pct: string;
    startDate: string;
    endDate: string;
}

interface RoomPrice {
    type: string;
    base: string;
    weekend: string;
    status: string;
}

/* ── modal components ── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#e8e8e8]">
                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">{title}</span>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-1 rounded hover:bg-[#f5f5f5]">
                        <X size={16} color="#828282" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: {
    label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
    return (
        <div className="mb-3">
            <label className="block text-[11px] font-bold text-[#828282] tracking-widest mb-1">{label}{required && " *"}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-[#e0e0e0] rounded-lg px-3 py-2 text-[13px] text-[#1d1d1d] outline-none focus:border-[#953002] box-border"
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
    return (
        <div className="mb-3">
            <label className="block text-[11px] font-bold text-[#828282] tracking-widest mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-[#e0e0e0] rounded-lg px-3 py-2 text-[13px] text-[#1d1d1d] outline-none focus:border-[#953002] bg-white box-border"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

/* ── main content ── */
function RateContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    const [roomPrices, setRoomPrices] = useState<RoomPrice[]>([]);
    const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
    const [seasons, setSeasons] = useState<SeasonItem[]>([]);
    const [kpis, setKpis] = useState({ averageRate: "—", occupancyForecast: "—", activeDiscountCount: 0 });
    const [weekendFri, setWeekendFri] = useState(true);
    const [weekendSun, setWeekendSun] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Discount modal state
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);
    const [dName, setDName] = useState("");
    const [dType, setDType] = useState("EARLY_BIRD");
    const [dPct, setDPct] = useState("");
    const [dMinNights, setDMinNights] = useState("");
    const [dDaysAdv, setDDaysAdv] = useState("");
    const [dStartDate, setDStartDate] = useState("");
    const [dEndDate, setDEndDate] = useState("");
    const [dSaving, setDSaving] = useState(false);

    // Seasonal modal state
    const [showSeasonModal, setShowSeasonModal] = useState(false);
    const [sName, setSName] = useState("");
    const [sStart, setSStart] = useState("");
    const [sEnd, setSEnd] = useState("");
    const [sPct, setSPct] = useState("");
    const [sSaving, setSSaving] = useState(false);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Settings"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function mapData(data: any) {
        setRoomPrices((data.ratePlans || []).map((p: { roomType?: string; basePrice?: number; weekendPercentage?: string; status?: string }) => ({
            type: p.roomType || "—",
            base: p.basePrice?.toString() || "0",
            weekend: p.weekendPercentage || "+0%",
            status: p.status === "ACTIVE" ? "Active" : p.status === "DRAFT" ? "Draft" : (p.status || "—"),
        })));
        setDiscounts((data.discounts || []).map((d: { id?: number; name?: string; description?: string; percentage?: string; type?: string; isActive?: boolean; minNights?: number; daysInAdvance?: number; startDate?: string; endDate?: string }) => ({
            id: d.id ?? 0,
            name: d.name || "—",
            desc: d.description || "",
            pct: d.percentage ? `${d.percentage}%` : "0%",
            type: d.type || "EARLY_BIRD",
            icon: (d.type === "EARLY_BIRD" ? "gift" : "clock") as "gift" | "clock",
            active: !!d.isActive,
            minNights: d.minNights,
            daysInAdvance: d.daysInAdvance,
            startDate: d.startDate,
            endDate: d.endDate,
        })));
        setSeasons((data.seasonalPricing || []).map((s: { id?: number; name?: string; dateRange?: string; percentageAdjustment?: string; startDate?: string; endDate?: string }) => ({
            id: s.id ?? 0,
            name: s.name || "—",
            range: s.dateRange || "—",
            pct: s.percentageAdjustment || "0%",
            startDate: s.startDate || "",
            endDate: s.endDate || "",
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
    }

    useEffect(() => {
        if (!propertyId) { setError("No property ID provided."); setLoading(false); return; }
        Promise.all([
            propertiesApi.getProperty(Number(propertyId), ownerId),
            ratesApi.getRateOverview(Number(propertyId)),
        ])
            .then(([prop, data]) => { setProperty(prop); mapData(data); })
            .catch((err: { response?: { data?: { message?: string } }; message?: string }) =>
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load rate data."))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, ownerId]);

    /* ── discount modal helpers ── */
    function openCreateDiscount() {
        setEditingDiscount(null);
        setDName(""); setDType("EARLY_BIRD"); setDPct(""); setDMinNights(""); setDDaysAdv(""); setDStartDate(""); setDEndDate("");
        setShowDiscountModal(true);
    }
    function openEditDiscount(d: DiscountItem) {
        setEditingDiscount(d);
        setDName(d.name); setDType(d.type); setDPct(d.pct.replace("%", "")); setDMinNights(d.minNights?.toString() || ""); setDDaysAdv(d.daysInAdvance?.toString() || ""); setDStartDate(d.startDate || ""); setDEndDate(d.endDate || "");
        setShowDiscountModal(true);
    }
    async function saveDiscount() {
        if (!dName || !dPct || !propertyId) return;
        setDSaving(true);
        try {
            const payload = {
                propertyId: Number(propertyId),
                name: dName,
                type: dType,
                percentage: Number(dPct),
                minNights: dMinNights ? Number(dMinNights) : null,
                daysInAdvance: dDaysAdv ? Number(dDaysAdv) : null,
                startDate: dStartDate || null,
                endDate: dEndDate || null,
                isActive: true,
            };
            if (editingDiscount) {
                await ratesApi.updateDiscount(editingDiscount.id, payload);
            } else {
                await ratesApi.createDiscount(payload);
            }
            const data = await ratesApi.getRateOverview(Number(propertyId));
            mapData(data);
            setShowDiscountModal(false);
        } catch (e) {
            console.error("Failed to save discount:", e);
        } finally {
            setDSaving(false);
        }
    }
    async function deleteDiscount(id: number) {
        if (!confirm("Delete this discount?")) return;
        try {
            await ratesApi.deleteDiscount(id);
            setDiscounts((prev) => prev.filter((d) => d.id !== id));
        } catch (e) { console.error(e); }
    }

    /* ── seasonal modal helpers ── */
    function openCreateSeason() {
        setSName(""); setSStart(""); setSEnd(""); setSPct("");
        setShowSeasonModal(true);
    }
    async function saveSeason() {
        if (!sName || !sStart || !sEnd || !sPct || !propertyId) return;
        setSSaving(true);
        try {
            await ratesApi.createSeasonalPricing({
                propertyId: Number(propertyId),
                name: sName,
                startDate: sStart,
                endDate: sEnd,
                percentageAdjustment: Number(sPct),
            });
            const data = await ratesApi.getRateOverview(Number(propertyId));
            mapData(data);
            setShowSeasonModal(false);
        } catch (e) {
            console.error("Failed to save seasonal pricing:", e);
        } finally {
            setSSaving(false);
        }
    }
    async function deleteSeason(id: number) {
        if (!confirm("Delete this seasonal range?")) return;
        try {
            await ratesApi.deleteSeasonalPricing(id);
            setSeasons((prev) => prev.filter((s) => s.id !== id));
        } catch (e) { console.error(e); }
    }

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    return (
        <>
            <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
                <OwnerSidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex justify-end items-center py-2 px-6 bg-white border-b border-[#e8e8e8] shrink-0">
                        <div className="flex items-center gap-3">
                            <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                                <Bell size={18} color="#4f4f4f" />
                            </a>
                            <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-[12px] mb-2">
                            <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                            <ChevronRight size={13} color="#b0b0b0" />
                            <span className="text-[#953002] font-semibold">{property?.name ?? "Rates"}</span>
                        </div>

                        {loading && <div className="flex items-center justify-center py-20"><Loader2 size={28} color="#953002" className="animate-spin" /></div>}
                        {error && !loading && <div className="flex items-center justify-center py-20 text-[13px] text-[#e74c3c]">{error}</div>}

                        {!loading && !error && property && (
                            <>
                                {/* Property Header */}
                                <div className="bg-white border border-[#e8e8e8] rounded-[12px] py-2.5 px-4 flex items-center mb-0">
                                    <div className="w-[56px] h-[44px] rounded-lg overflow-hidden shrink-0 border border-[#e8e8e8] bg-[#f0ebe5] flex items-center justify-center mr-3">
                                        {property.image
                                            ? <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                            : <Building2 size={20} color="#c0a898" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[15px] font-extrabold m-0 text-[#1d1d1d] truncate">{property.name}</h2>
                                            <span className="text-[9px] font-bold text-white rounded px-[6px] py-[2px] tracking-widest shrink-0" style={{ backgroundColor: statusColor }}>{statusLabel}</span>
                                        </div>
                                        <div className="text-[11px] text-[#828282] flex items-center gap-3 mt-0.5">
                                            <span className="flex items-center gap-1"><MapPin size={11} />{[property.address, property.city, property.country].filter(Boolean).join(", ")}</span>
                                            <span className="flex items-center gap-1"><Bed size={11} />{property.roomCount ?? 0} Rooms</span>
                                            <span className="flex items-center gap-1"><Calendar size={11} />{property.rate ?? "—"}/night</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-[#e8e8e8] mb-4 mt-1.5">
                                    {tabs.map((t) => {
                                        const isActive = t === "Rates";
                                        return (
                                            <button key={t} onClick={() => {
                                                if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                                else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                                else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                                else if (t === "Rates") return;
                                                else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${propertyId}`;
                                                else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
                                                else if (t === "Settings") window.location.href = `/owner/properties/Setting?id=${propertyId}`;
                                            }}
                                                className={`bg-transparent py-2 px-3.5 text-[12px] cursor-pointer transition-all duration-150 border-b-2 whitespace-nowrap ${isActive ? "text-[#953002] font-bold border-[#953002]" : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"}`}>
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-5">
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                        <div className="text-[11px] font-semibold text-[#828282] mb-1">Average Nightly Rate</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[24px] font-extrabold text-[#1d1d1d]">{kpis.averageRate}</span>
                                            <TrendingUp size={13} color="#27ae60" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                        <div className="text-[11px] font-semibold text-[#828282] mb-1">Occupancy Forecast</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[24px] font-extrabold text-[#1d1d1d]">{kpis.occupancyForecast}</span>
                                            <TrendingDown size={13} color="#eb5757" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                        <div className="text-[11px] font-semibold text-[#828282] mb-1">Active Discounts</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[24px] font-extrabold text-[#1d1d1d]">{kpis.activeDiscountCount} Rules</span>
                                            <CheckCircle size={13} color="#27ae60" />
                                        </div>
                                    </div>
                                </div>

                                {/* Two-column layout */}
                                <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
                                    {/* Left */}
                                    <div className="flex flex-col gap-4">
                                        {/* Room Base Prices */}
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Room Base Prices</h3>
                                                <button className="flex items-center gap-1 bg-transparent border-none text-[#953002] text-[12px] font-semibold cursor-pointer hover:opacity-80">
                                                    <Plus size={13} /> Add Room Type
                                                </button>
                                            </div>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr>
                                                        <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2 px-3 text-left border-b border-[#e8e8e8]">ROOM TYPE</th>
                                                        <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2 px-3 text-center border-b border-[#e8e8e8]">BASE PRICE (Rs)</th>
                                                        <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2 px-3 text-center border-b border-[#e8e8e8]">WEEKEND %</th>
                                                        <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2 px-3 text-center border-b border-[#e8e8e8]">STATUS</th>
                                                        <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2 px-3 text-center border-b border-[#e8e8e8]">ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {roomPrices.length === 0
                                                        ? <tr><td colSpan={5} className="py-8 text-center text-[13px] text-[#b0b0b0]">No room prices configured yet.</td></tr>
                                                        : roomPrices.map((r, i) => (
                                                            <tr key={i} className="border-b border-[#f5f5f5]">
                                                                <td className="py-3 px-3 text-[13px] font-semibold text-[#1d1d1d]">{r.type}</td>
                                                                <td className="py-3 px-3 text-[14px] text-center font-bold text-[#1d1d1d]">{r.base}</td>
                                                                <td className="py-3 px-3 text-[13px] text-center font-semibold text-[#953002]">{r.weekend}</td>
                                                                <td className="py-3 px-3 text-center">
                                                                    <span className={`text-[10px] font-semibold py-0.5 px-2.5 rounded-full ${r.status === "Active" ? "text-[#27ae60] bg-[#e8f5e9]" : "text-[#828282] bg-[#f5f5f5]"}`}>{r.status}</span>
                                                                </td>
                                                                <td className="py-3 px-3 text-center">
                                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded hover:bg-[#f5f5f5]"><Edit size={14} color="#828282" /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Special Discounts */}
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Special Discounts</h3>
                                                <button
                                                    onClick={openCreateDiscount}
                                                    className="py-1.5 px-4 bg-[#953002] text-white border-none rounded-full text-[10px] font-bold cursor-pointer tracking-wider hover:bg-[#b03a02] transition-colors"
                                                >
                                                    + CREATE NEW DISCOUNT
                                                </button>
                                            </div>
                                            {discounts.length === 0
                                                ? <div className="py-8 text-center text-[13px] text-[#b0b0b0]">No discounts yet. Click &ldquo;Create New Discount&rdquo; to add one.</div>
                                                : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {discounts.map((d) => (
                                                            <div key={d.id} className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                                                        {d.icon === "gift" ? <Gift size={18} color="#953002" /> : <Clock size={18} color="#953002" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[13px] font-bold text-[#1d1d1d] truncate">{d.name}</span>
                                                                            <span className="text-[13px] font-bold text-[#953002] shrink-0 ml-1">{d.pct}</span>
                                                                        </div>
                                                                        <div className="text-[11px] text-[#828282] mt-0.5">{d.type}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-2.5">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${d.active ? "bg-[#27ae60]" : "bg-[#b0b0b0]"}`} />
                                                                        <span className={`text-[10px] font-bold tracking-wider ${d.active ? "text-[#27ae60]" : "text-[#b0b0b0]"}`}>{d.active ? "ACTIVE" : "INACTIVE"}</span>
                                                                    </span>
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => openEditDiscount(d)} className="bg-transparent border-none text-[#828282] text-[11px] cursor-pointer hover:text-[#953002] transition-colors">
                                                                            <Edit size={13} />
                                                                        </button>
                                                                        <button onClick={() => deleteDiscount(d.id)} className="bg-transparent border-none text-[#e74c3c] cursor-pointer hover:opacity-70">
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="flex flex-col gap-3">
                                        {/* Seasonal Pricing */}
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                            <h4 className="text-[15px] font-extrabold text-[#1d1d1d] m-0 mb-4">Seasonal Pricing</h4>
                                            {seasons.length === 0
                                                ? <p className="text-[12px] text-[#b0b0b0] text-center py-2">No seasonal ranges yet.</p>
                                                : seasons.map((sn) => (
                                                    <div key={sn.id} className="mb-3 pb-3 border-b border-[#f5f5f5] last:border-b-0 last:mb-0 last:pb-0">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0 mr-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-[13px] font-bold text-[#1d1d1d] truncate">{sn.name}</span>
                                                                    <span className={`text-[13px] font-bold shrink-0 ml-1 ${sn.pct.startsWith("+") ? "text-[#27ae60]" : "text-[#eb5757]"}`}>{sn.pct}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <CalendarRange size={11} color="#b0b0b0" />
                                                                    <span className="text-[11px] text-[#828282]">{sn.range}</span>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => deleteSeason(sn.id)} className="bg-transparent border-none cursor-pointer text-[#e74c3c] hover:opacity-70 p-0.5 shrink-0">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            <button
                                                onClick={openCreateSeason}
                                                className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-[#953002] rounded-lg bg-transparent text-[#953002] text-[12px] font-semibold cursor-pointer hover:bg-[#fef5ef] transition-colors mt-2"
                                            >
                                                <CalendarRange size={13} color="#953002" /> Add Seasonal Range
                                            </button>
                                        </div>

                                        {/* Weekend Multipliers */}
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                            <h4 className="text-[15px] font-extrabold text-[#1d1d1d] m-0 mb-4">Weekend Multipliers</h4>
                                            <div className="flex justify-between items-center py-3 border-b border-[#f5f5f5]">
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">Friday & Saturday</div>
                                                    <div className="text-[11px] text-[#828282]">Standard surcharge</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-[#1d1d1d]">15%</span>
                                                    <button onClick={() => setWeekendFri(!weekendFri)} className={`w-10 h-5 rounded-full border-none cursor-pointer flex items-center px-0.5 transition-all duration-200 ${weekendFri ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                                        <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">Sunday Night</div>
                                                    <div className="text-[11px] text-[#828282]">Off-peak adjustment</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-[#1d1d1d]">0%</span>
                                                    <button onClick={() => setWeekendSun(!weekendSun)} className={`w-10 h-5 rounded-full border-none cursor-pointer flex items-center px-0.5 transition-all duration-200 ${weekendSun ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                                        <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* ── Discount Modal ── */}
            {showDiscountModal && (
                <Modal title={editingDiscount ? "Edit Discount" : "Create New Discount"} onClose={() => setShowDiscountModal(false)}>
                    <InputField label="DISCOUNT NAME" value={dName} onChange={setDName} placeholder="e.g. Early Bird 10%" required />
                    <SelectField label="DISCOUNT TYPE" value={dType} onChange={setDType} options={[
                        { value: "EARLY_BIRD", label: "Early Bird" },
                        { value: "LAST_MINUTE", label: "Last Minute" },
                        { value: "LONG_STAY", label: "Long Stay" },
                        { value: "SEASONAL", label: "Seasonal" },
                    ]} />
                    <InputField label="PERCENTAGE (%)" type="number" value={dPct} onChange={setDPct} placeholder="e.g. 10" required />
                    <InputField label="MIN NIGHTS (optional)" type="number" value={dMinNights} onChange={setDMinNights} placeholder="e.g. 3" />
                    <InputField label="DAYS IN ADVANCE (optional)" type="number" value={dDaysAdv} onChange={setDDaysAdv} placeholder="e.g. 30" />
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="START DATE" type="date" value={dStartDate} onChange={setDStartDate} />
                        <InputField label="END DATE" type="date" value={dEndDate} onChange={setDEndDate} />
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowDiscountModal(false)} className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg text-[13px] font-semibold text-[#4f4f4f] bg-white cursor-pointer hover:bg-[#f5f5f5]">
                            Cancel
                        </button>
                        <button onClick={saveDiscount} disabled={dSaving || !dName || !dPct} className="flex-1 py-2.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {dSaving ? "Saving…" : editingDiscount ? "Save Changes" : "Create Discount"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Seasonal Pricing Modal ── */}
            {showSeasonModal && (
                <Modal title="Add Seasonal Range" onClose={() => setShowSeasonModal(false)}>
                    <InputField label="SEASON NAME" value={sName} onChange={setSName} placeholder="e.g. Peak Summer" required />
                    <div className="grid grid-cols-2 gap-3">
                        <InputField label="START DATE" type="date" value={sStart} onChange={setSStart} required />
                        <InputField label="END DATE" type="date" value={sEnd} onChange={setSEnd} required />
                    </div>
                    <InputField label="PRICE ADJUSTMENT (%)" type="number" value={sPct} onChange={setSPct} placeholder="e.g. +20 or -10" required />
                    <p className="text-[11px] text-[#828282] mt-1 mb-3">Use positive values for surcharges (e.g. 20 = +20%) and negative for discounts (e.g. -10 = -10%).</p>
                    <div className="flex gap-3 mt-2">
                        <button onClick={() => setShowSeasonModal(false)} className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg text-[13px] font-semibold text-[#4f4f4f] bg-white cursor-pointer hover:bg-[#f5f5f5]">
                            Cancel
                        </button>
                        <button onClick={saveSeason} disabled={sSaving || !sName || !sStart || !sEnd || !sPct} className="flex-1 py-2.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {sSaving ? "Saving…" : "Add Range"}
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default function RatePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#faf9f7]"><Loader2 size={28} color="#953002" className="animate-spin" /></div>}>
            <RateContent />
        </Suspense>
    );
}