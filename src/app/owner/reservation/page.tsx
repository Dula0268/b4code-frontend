/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { reservationsApi } from "@/api/owner/reservations.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { exportToCsv } from "@/lib/csv-export";
import {
    Bell,
    Building2,
    Calendar,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    XCircle,
    Trash2,
    MoreVertical,
    Download,
    Plus,
    SlidersHorizontal,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/* ───────────────────── component ───────────────────── */

/**
 * ReservationPage Component
 *
 * Lists all guest reservations with KPI cards, search/filter controls,
 * and an interactive data table with pagination.
 */
export default function ReservationPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reservationsData, setReservationsData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [metrics, setMetrics] = useState({
        confirmed: 0,
        pending: 0,
        checkInsToday: 0,
        cancellations: 0,
        totalBookingsThisMonth: 0
    });
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const data = await reservationsApi.listReservations(ownerId, searchQuery);
                setReservationsData(data.reservations || []);
                setTotalItems(data.totalItems || 0);
                setTotalPages(data.totalPages || 1);
                setMetrics({
                    confirmed: data.confirmed || 0,
                    pending: data.pending || 0,
                    checkInsToday: data.checkInsToday || 0,
                    cancellations: data.cancellations || 0,
                    totalBookingsThisMonth: data.totalBookingsThisMonth || 0
                });
            } catch (error) {
                console.error("Failed to fetch reservations:", error);
            }
        };
        const timeoutId = setTimeout(() => {
            fetchReservations();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, ownerId]);

    const handleExportCsv = () => {
        exportToCsv(
            "reservations",
            reservationsData.map((r) => ({
                "Guest Name": r.guestName ?? "",
                "Property": r.propertyName ?? "",
                "Room": r.roomName ?? "",
                "Check In": r.checkIn ?? "",
                "Check Out": r.checkOut ?? "",
                "Payment Status": r.paymentStatus ?? "",
                "Status": r.status ?? "",
            }))
        );
    };

    return (
        <div className="w-full h-full flex-1 flex flex-col overflow-hidden">

                {/* Scrollable body */}
                <div className="w-full flex-1 overflow-y-auto px-8 pt-6 pb-10">
                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-4.5">
                        <div>
                            <h1 className="text-[28px] font-black text-[#1d1d1d] m-0 tracking-wide">RESERVATIONS</h1>
                            <div className="mt-1 text-[13px]">
                                <span className="text-[var(--brand-primary)] font-extrabold text-[18px]">{metrics.totalBookingsThisMonth}</span>{" "}
                                <span className="text-[#828282]">total bookings this month</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportCsv}
                                disabled={reservationsData.length === 0}
                                className="flex items-center gap-1.5 py-2.5 px-5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5] transition-colors"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                            <a href="/owner/reservation/reservationDetails/manualBooking" className="no-underline">
                                <button className="flex items-center gap-1.5 py-2.5 px-5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                                    <Plus size={14} /> Manual Booking
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="w-full grid grid-cols-4 gap-3.5 mb-4.5">
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CONFIRMED</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">{metrics.confirmed}</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">PENDING CONFIRMATION</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">{metrics.pending}</span>
                                <span className="text-[9px] font-bold text-[#828282] tracking-wide">NEEDS ATTENTION</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CHECK-INS TODAY</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">{metrics.checkInsToday}</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CANCELLATIONS</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">{metrics.cancellations}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex justify-between items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-1 max-w-[400px] bg-white border border-[#e0e0e0] rounded-lg py-2 px-3.5">
                            <Search size={16} color="#b0b0b0" />
                            <input
                                type="text"
                                placeholder="Search by guest or property..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-none outline-none text-[13px] text-[#1d1d1d] flex-1 font-sans bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Building2 size={14} /> All Properties <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Calendar size={14} /> Date Range <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                Status <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center justify-center w-9 h-9 bg-white border border-[#e0e0e0] rounded-lg cursor-pointer">
                                <SlidersHorizontal size={16} color="#4f4f4f" />
                            </button>
                        </div>
                    </div>

                    {/* Reservations Table */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F6F8F7]">
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">GUEST NAME</th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">PROPERTY / ROOM</th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">DATES</th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-center uppercase">PAYMENT</th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-center uppercase">STATUS</th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-center uppercase">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservationsData.map((r, i) => {
                                    // Generate tailwind classes dynamically for now based on status/tier, or fallback to default
                                    const paymentColorClass = r.paymentStatus === "Paid" ? "text-[#27ae60]" : r.paymentStatus === "Partial" ? "text-[#f2994a]" : "text-[#eb5757]";
                                    const paymentDotClass = r.paymentStatus === "Paid" ? "bg-[#27ae60]" : r.paymentStatus === "Partial" ? "bg-[#f2994a]" : "bg-[#eb5757]";
                                    const statusBgClass = r.status === "CONFIRMED" ? "bg-[#27ae60]" : r.status === "PENDING" ? "bg-[#f2994a]" : "bg-[#eb5757]";
                                    const initialsBgClass = "bg-[#e8d4c8]";
                                    const initialsColorClass = "text-[var(--brand-primary)]";
                                    const tierColorClass = "text-[#828282]";

                                    return (
                                    <tr key={i} className={`border-t border-[#e0e0e0] transition-colors hover:bg-[#f5efec] ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${initialsBgClass} ${initialsColorClass}`}>
                                                    {r.guestInitials || r.guestName?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">{r.guestName}</div>
                                                    <div className={`text-[9px] font-bold tracking-wide ${tierColorClass}`}>{r.guestTier || "GUEST"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle">
                                            <div className="text-[13px] font-semibold text-[#1d1d1d]">{r.propertyName}</div>
                                            <div className="text-[11px] text-[#828282]">{r.roomName}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <div>
                                                    <div className={`text-[13px] font-bold text-[#1d1d1d]`}>{r.checkIn}</div>
                                                    <div className="text-[9px] text-[#b0b0b0] font-semibold">CHECK-IN</div>
                                                </div>
                                                <span className="text-[#e0e0e0] text-[14px]">→</span>
                                                <div>
                                                    <div className={`text-[13px] font-bold text-[#1d1d1d]`}>{r.checkOut}</div>
                                                    <div className="text-[9px] text-[#b0b0b0] font-semibold">CHECK-OUT</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle text-center">
                                            <span className={`text-[11px] font-semibold inline-flex items-center gap-1 ${paymentColorClass}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${paymentDotClass}`} />
                                                {r.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle text-center">
                                            <span className={`text-[10px] font-bold text-white rounded-full px-3 py-1 tracking-wide inline-block ${statusBgClass}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-[13px] text-[#4f4f4f] align-middle text-center">
                                            <div className="flex justify-center gap-1.5">
                                                <button className="bg-transparent border-none cursor-pointer p-1 rounded"><Eye size={15} color="#828282" /></button>
                                                {r.status === "CANCELLED" ? (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><Trash2 size={15} color="#828282" /></button>
                                                ) : (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><XCircle size={15} color="#828282" /></button>
                                                )}
                                                {r.status === "PENDING" && (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><MoreVertical size={15} color="#828282" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center py-3.5 px-4 border-t border-[#e8e8e8]">
                            <span className="text-[12px] text-[var(--brand-primary)]">Showing {Math.min((currentPage - 1) * 10 + 1, totalItems)} to {Math.min(currentPage * 10, totalItems)} of {totalItems} results</span>
                            <div className="flex items-center gap-1">
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#4f4f4f] rounded-md"><ChevronLeft size={14} /></button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center border-none cursor-pointer text-[12px] font-semibold rounded-md ${
                                            currentPage === p ? "bg-[#27ae60] text-white" : "bg-transparent text-[#4f4f4f]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#4f4f4f] rounded-md"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
