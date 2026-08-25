/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/api/owner/dashboard.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Search,
    DoorOpen,
    Bell,
    Building2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ClipboardList,
    DollarSign,
} from "lucide-react";


/* ───────────────────── helpers ───────────────────── */

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

function getCalendarDays(year: number, month: number) {
    const firstDay     = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const daysInPrev   = new Date(year, month, 0).getDate();
    const days: { day: number; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
        days.push({ day: daysInPrev - i, current: false });
    for (let d = 1; d <= daysInMonth; d++)
        days.push({ day: d, current: true });
    const rem = 7 - (days.length % 7);
    if (rem < 7) for (let d = 1; d <= rem; d++) days.push({ day: d, current: false });
    return days;
}

function formatRevenue(v: string | null | undefined): string {
    if (!v) return "Rs. 0";
    const n = parseFloat(v);
    if (isNaN(n)) return `Rs. ${v}`;
    if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `Rs. ${Math.round(n / 1_000)}K`;
    return `Rs. ${n.toLocaleString()}`;
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
    CONFIRMED:  { color: "#953002", bg: "#fef5ef" },
    CHECKED_IN: { color: "#2e7d32", bg: "#e8f5e9" },
    COMPLETED:  { color: "#828282", bg: "#f5f5f5" },
    CANCELLED:  { color: "#e74c3c", bg: "#fdecea" },
    PENDING:    { color: "#e67e22", bg: "#fff8e1" },
};
const INITIALS_COLORS = ["#8B6914","#953002","#2e7d32","#1565c0","#6a1b9a"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBooking(b: any, i: number) {
    const name   = b.guestName ?? "?";
    const parts  = name.trim().split(" ");
    const inits  = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
    const style  = STATUS_STYLE[b.status] ?? { color: "#828282", bg: "#f5f5f5" };
    const ci     = b.checkIn  ? new Date(b.checkIn).toLocaleDateString("en-GB",  { day: "2-digit", month: "short" }).toUpperCase() : "—";
    const co     = b.checkOut ? new Date(b.checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase() : "—";
    const nights = b.checkIn && b.checkOut
        ? Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86_400_000))
        : null;
    return {
        id:           b.id,
        initials:     inits,
        initialsColor: INITIALS_COLORS[i % INITIALS_COLORS.length],
        name,
        propertyName: b.propertyName ?? "—",
        code:         b.confirmationCode ?? "—",
        dates:        `${ci} – ${co}`,
        nights:       nights ? `${nights} Night${nights > 1 ? "s" : ""}` : "—",
        status:       b.status ?? "—",
        statusColor:  style.color,
        statusBg:     style.bg,
        amount:       b.totalAmount && b.totalAmount !== "0" ? `Rs. ${parseFloat(b.totalAmount).toLocaleString()}` : "—",
    };
}

/* ───────────────────── component ───────────────────── */

export default function OwnerDashboardPage() {
    const { user } = useAuthStore();
    const now = new Date();
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear,  setCalYear]  = useState(now.getFullYear());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data,    setData]    = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        dashboardApi.getDashboard(user?.userId)
            .then(setData)
            .catch(() => setError("Could not load dashboard data. Check your connection."))
            .finally(() => setLoading(false));
    }, [user?.userId]);

    const calDays        = getCalendarDays(calYear, calMonth);
    const todayDay       = now.getMonth() === calMonth && now.getFullYear() === calYear ? now.getDate() : -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentBookings: ReturnType<typeof mapBooking>[] = ((data?.recentBookings ?? []) as any[]).map(mapBooking);

    const prevMonth = () => calMonth === 0  ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
    const nextMonth = () => calMonth === 11 ? (setCalMonth(0),  setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

    /* metric cards — only real API values, no fake fallbacks */
    const metrics = [
        { label: "TOTAL PROPERTIES", value: loading ? null : String(data?.totalProperties  ?? 0), highlight: false },
        { label: "TOTAL ROOMS",      value: loading ? null : String(data?.totalRoomTypes       ?? 0), highlight: false },
        { label: "ACTIVE RESV.",     value: loading ? null : String(data?.activeBookings   ?? 0), highlight: false },
        { label: "TOTAL BOOKINGS",   value: loading ? null : String(data?.totalBookings    ?? 0), highlight: false },
        { label: "TODAY CHECK-INS",  value: loading ? null : String(data?.todayCheckIns   ?? 0), highlight: false },
        { label: "TOTAL REVENUE",    value: loading ? null : formatRevenue(data?.totalRevenue),   highlight: true  },
    ];

    return (
        <div className="w-full h-full flex-1 overflow-y-auto px-6 pt-4 pb-4">

                {/* Error Banner */}
                {error && (
                    <div className="mb-3 px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium">
                        {error}
                    </div>
                )}

                {/* ── Metric Cards ── */}
                <div className="w-full grid grid-cols-6 gap-3 mb-4">
                    {metrics.map(({ label, value, highlight }) => (
                        <div
                            key={label}
                            className={`rounded-2xl border px-4 py-3 flex flex-col gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 ${
                                highlight ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-[#e0e0e0] bg-white"
                            }`}
                        >
                            <span className={`text-[9px] font-bold tracking-wider uppercase ${
                                highlight ? "text-[rgba(255,255,255,0.8)]" : "text-[#828282]"
                            }`}>
                                {label}
                            </span>
                            {value === null ? (
                                <div className="h-8 w-16 rounded bg-[#e0e0e0] animate-pulse mt-1" />
                            ) : (
                                <span className={`text-[28px] font-extrabold leading-none mt-1 ${
                                    highlight ? "text-white" : "text-[#1d1d1d]"
                                }`}>
                                    {value}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Middle: Calendar + Reservations ── */}
                <div className="w-full grid grid-cols-[minmax(280px,1fr)_minmax(400px,1.6fr)] gap-4 mb-4">

                    {/* Calendar */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[15px] font-bold text-[#1d1d1d]">Availability Preview</div>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="w-7 h-7 rounded-md bg-white border border-[#e0e0e0] flex items-center justify-center cursor-pointer">
                                    <ChevronLeft size={14} color="#4f4f4f" />
                                </button>
                                <button onClick={nextMonth} className="w-7 h-7 rounded-md bg-white border border-[#e0e0e0] flex items-center justify-center cursor-pointer">
                                    <ChevronRight size={14} color="#4f4f4f" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e0e0e0] rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[14px] font-bold text-[#1d1d1d]">
                                    {MONTH_NAMES[calMonth]} {calYear}
                                </span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {["SU","MO","TU","WE","TH","FR","SA"].map(d => (
                                    <div key={d} className="text-center text-[10px] font-semibold text-[#b0b0b0] py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calDays.map((d, i) => (
                                    <div key={i} className={`text-center py-1.5 text-[12px] rounded-full font-medium ${
                                        !d.current        ? "text-[#d0d0d0]"
                                        : d.day === todayDay ? "bg-[var(--brand-primary)] text-white font-bold"
                                        : "text-[#1d1d1d]"
                                    }`}>
                                        {d.day}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Reservations */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[15px] font-bold text-[#1d1d1d]">Recent Reservations</div>
                            <a href="/owner/reservation" className="bg-transparent border-none text-[13px] font-semibold text-[var(--brand-primary)] cursor-pointer no-underline hover:underline">
                                View All
                            </a>
                        </div>
                        <div className="bg-white border border-[#e0e0e0] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={22} color="#953002" className="animate-spin" />
                                </div>
                            ) : recentBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                    <ClipboardList size={32} color="#d0d0d0" />
                                    <p className="text-[13px] text-[#828282] mt-2 m-0">No reservations yet.</p>
                                    <p className="text-[11px] text-[#b0b0b0] mt-1 m-0">Bookings will appear here once guests make reservations.</p>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-[12px]">
                                    <thead>
                                        <tr>
                                            {["GUEST","PROPERTY","BOOKING #","DATES","AMOUNT","STATUS"].map(h => (
                                                <th key={h} className="text-left py-2.5 px-3 text-[9px] font-bold tracking-wider text-[#828282] border-b border-[#e0e0e0] uppercase">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map((r) => (
                                            <tr key={r.id} className="border-b border-[#f5f5f5]">
                                                <td className="py-2.5 px-3 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: r.initialsColor }}>
                                                            {r.initials}
                                                        </div>
                                                        <span className="font-semibold text-[12px] text-[#1d1d1d]">{r.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 align-middle text-[12px] text-[#4f4f4f]">{r.propertyName}</td>
                                                <td className="py-2.5 px-3 align-middle text-[11px] text-[#828282] font-mono">{r.code}</td>
                                                <td className="py-2.5 px-3 align-middle">
                                                    <div className="text-[12px] font-medium text-[#1d1d1d]">{r.dates}</div>
                                                    <div className="text-[10px] text-[#b0b0b0]">{r.nights}</div>
                                                </td>
                                                <td className="py-2.5 px-3 align-middle text-[12px] font-semibold text-[#1d1d1d]">{r.amount}</td>
                                                <td className="py-2.5 px-3 align-middle">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide" style={{ color: r.statusColor, background: r.statusBg }}>
                                                        {r.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Bottom Stats ── */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Properties */}
                    <div className="bg-white border border-[#e0e0e0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0">
                            <Building2 size={20} color="#953002" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">MY PROPERTIES</span>
                            {loading
                                ? <div className="h-5 w-8 rounded bg-[#e0e0e0] animate-pulse mt-1" />
                                : <span className="text-[18px] font-extrabold text-[#1d1d1d]">{data?.totalProperties ?? 0}</span>
                            }
                        </div>
                    </div>

                    {/* Total Rooms */}
                    <div className="bg-white border border-[#e0e0e0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center shrink-0">
                            <DoorOpen size={20} color="#2e7d32" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">TOTAL ROOMS</span>
                            {loading
                                ? <div className="h-5 w-8 rounded bg-[#e0e0e0] animate-pulse mt-1" />
                                : <span className="text-[18px] font-extrabold text-[#2e7d32]">{data?.totalRoomTypes ?? 0}</span>
                            }
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-white border border-[#e0e0e0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0">
                            <DollarSign size={20} color="#953002" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">TOTAL REVENUE</span>
                            {loading
                                ? <div className="h-5 w-16 rounded bg-[#e0e0e0] animate-pulse mt-1" />
                                : <span className="text-[18px] font-extrabold text-[var(--brand-primary)]">{formatRevenue(data?.totalRevenue)}</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
