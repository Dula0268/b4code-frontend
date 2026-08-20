"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize2,
  MoreVertical,
  ChevronDown,
  Calendar,
  Loader2,
  Search,
} from "lucide-react";
import { useAdminAnalyticsStore } from "@/store/admin/analytics/admin-analytics.store";
import { RevPar } from "@/api/admin/analytics.api";

// ─── Room Data ────────────────────────────────────────────────────────────────


const ITEMS_PER_PAGE = 3;

// We will dynamically compute categories inside the component
// const ROOM_CATEGORIES = [ ... ];

// ─── Utility ──────────────────────────────────────────────────────────────────
const formatCategory = (cat: string) => {
  if (cat === "All Categories") return cat;
  return cat.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room }: { room: RevPar }) {
  return (
    <div className="flex items-stretch gap-0 bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden">
      {/* Room Image */}
      <div className="relative w-[200px] flex-shrink-0">
        <Image
          src={room.image}
          alt={room.propertyName}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover"
        />
      </div>

      {/* Room Info */}
      <div className="flex flex-1 items-center justify-between p-6 gap-6">
        {/* Left: type + name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-widest text-[#C05621] uppercase m-0 mb-1">
            {formatCategory(room.type)} &bull; {room.roomNumber}
          </p>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-snug m-0 mb-3">
            {room.propertyName}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users size={13} color="#9E7B6A" />
              <span className="text-[12px] text-[#9E7B6A]">{room.adults} Adults</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 size={12} color="#9E7B6A" />
              <span className="text-[12px] text-[#9E7B6A]">{room.sqm} m²</span>
            </div>
          </div>
        </div>

        {/* Right: metrics */}
        <div className="flex items-center gap-10">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0 mb-1">
              Occupancy
            </p>
            <p
              className="text-[22px] font-bold leading-none m-0"
              style={{ color: room.occupancyRate >= 80 ? "#2D7D5C" : "#C05621" }}
            >
              {Math.round(room.occupancyRate)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0 mb-1">
              ADR
            </p>
            <p className="text-[22px] font-bold text-[#1A1A1A] leading-none m-0">
              {room.currency} {room.avgDailyRate.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#C05621] uppercase m-0 mb-1">
              RevPAR (Calculated)
            </p>
            <p className="text-[26px] font-bold text-[#1A1A1A] leading-none m-0">
              {room.currency} {room.revpar.toFixed(2)}
            </p>
          </div>

          {/* Three dot menu */}
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0EBE7] transition-colors">
            <MoreVertical size={16} color="#9E7B6A" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RevparDetailPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { revParBreakdown, loading, fetchAnalyticsData } = useAdminAnalyticsStore();

  useEffect(() => {
    if (revParBreakdown.length === 0) {
      fetchAnalyticsData();
    }
  }, [revParBreakdown.length, fetchAnalyticsData]);

  const filtered = revParBreakdown.filter((r) => {
    const matchesCategory = selectedCategory === "All Categories" || r.type === selectedCategory;
    const matchesSearch =
      (r.propertyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.roomNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageRooms = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    setCategoryOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const dynamicCategories = ["All Categories", ...Array.from(new Set(revParBreakdown.map(r => r.type)))];

  const getPaginationItems = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/analytics")}
            className="text-[12px] font-medium text-[#9E7B6A] hover:text-[#C05621] transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Analytics Portal
          </button>
          <span className="text-[12px] text-[#C8B8B0]">/</span>
          <span className="text-[12px] font-bold text-[#1A1A1A] tracking-wide uppercase">
            RevPAR Details
          </span>
        </div>

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0">
              Revenue Breakdown
            </h1>
            <p className="text-[13px] text-[#9E7B6A] mt-1">
              Deep-dive into individual room performance metrics for the current cycle.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DDD8] rounded-xl shadow-sm min-w-[240px]">
              <Search size={14} color="#9E7B6A" />
              <input
                type="text"
                placeholder="property name, room number"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full text-[13px] text-[#1A1A1A] placeholder:text-[#C8B8B0] outline-none border-none bg-transparent"
              />
            </div>

            {/* Room Category dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DDD8] rounded-xl text-[13px] text-[#1A1A1A] shadow-sm hover:border-[#C05621] transition-colors"
              >
                <span className="text-[10px] font-semibold text-[#9E7B6A] uppercase tracking-wider">
                  Room Category
                </span>
                <span className="font-medium">{formatCategory(selectedCategory)}</span>
                <ChevronDown size={14} color="#9E7B6A" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E8DDD8] rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                  {dynamicCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#FFF3EE] text-[#C05621] font-semibold"
                          : "text-[#1A1A1A] hover:bg-[#FAF5F2]"
                      }`}
                    >
                      {formatCategory(cat)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Room Cards ── */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#F0EBE7] p-12 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#C05621] mb-2" size={32} />
              <p className="text-[#9E7B6A] text-[14px]">Loading property data...</p>
            </div>
          ) : pageRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0EBE7] p-12 text-center">
              <p className="text-[#9E7B6A] text-[14px]">
                No properties found for selected category.
              </p>
            </div>
          ) : (
            pageRooms.map((room) => <RoomCard key={room.roomNumber} room={room} />)
          )}
        </div>

        {/* ── Footer: Count + Pagination ── */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
            Showing {pageRooms.length} of {filtered.length} high-yield units
          </p>

          {/* Pagination — amber active style matching finance pages */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl border border-[#E8DDD8] flex items-center justify-center bg-white disabled:opacity-40 hover:bg-[#FAF5F2] transition-colors"
            >
              <ChevronLeft size={16} color="#6B4A3A" />
            </button>

            {getPaginationItems().map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="text-[#9E7B6A] font-medium tracking-widest px-1">
                    ...
                  </span>
                );
              }
              const page = item as number;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-[13px] font-semibold border transition-colors ${
                    currentPage === page
                      ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                      : "bg-white text-[#1A1A1A] border-[#E8DDD8] hover:bg-[#FAF5F2]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl border border-[#E8DDD8] flex items-center justify-center bg-white disabled:opacity-40 hover:bg-[#FAF5F2] transition-colors"
            >
              <ChevronRight size={16} color="#6B4A3A" />
            </button>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
