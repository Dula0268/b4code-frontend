"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize2,
  MoreVertical,
  ChevronDown,
  Calendar,
} from "lucide-react";

// ─── Room Data ────────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: 1,
    type: "Suite",
    roomNumber: "Room 104",
    name: "Ocean Wing Master Suite",
    adults: 2,
    sqm: 120,
    occupancy: 92,
    adr: 540.0,
    revpar: 496.8,
    image: "/images/rooms/room-ocean-king.jpg",
  },
  {
    id: 2,
    type: "Villa",
    roomNumber: "Room V-02",
    name: "Canopy Garden Sanctuary",
    adults: 4,
    sqm: 240,
    occupancy: 78,
    adr: 720.0,
    revpar: 561.6,
    image: "/images/rooms/room-grand-suite.jpg",
  },
  {
    id: 3,
    type: "Penthouse",
    roomNumber: "Room P-01",
    name: "The Celestial Observatory",
    adults: 2,
    sqm: 180,
    occupancy: 64,
    adr: 1200.0,
    revpar: 768.0,
    image: "/images/rooms/room-water-villa.jpg",
  },
  {
    id: 4,
    type: "Suite",
    roomNumber: "Room 201",
    name: "Horizon Infinity Suite",
    adults: 3,
    sqm: 160,
    occupancy: 85,
    adr: 680.0,
    revpar: 578.0,
    image: "/images/rooms/room-executive.jpg",
  },
  {
    id: 5,
    type: "Villa",
    roomNumber: "Room V-05",
    name: "Palm Retreat Sanctuary",
    adults: 6,
    sqm: 320,
    occupancy: 71,
    adr: 960.0,
    revpar: 681.6,
    image: "/images/rooms/room-heritage.jpg",
  },
  {
    id: 6,
    type: "Eco Cabin",
    roomNumber: "Room E-03",
    name: "Rainforest Eco Retreat",
    adults: 2,
    sqm: 95,
    occupancy: 88,
    adr: 380.0,
    revpar: 334.4,
    image: "/images/rooms/room-eco-cabin.jpg",
  },
];

const ITEMS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(ROOMS.length / ITEMS_PER_PAGE);

const ROOM_CATEGORIES = [
  "All Categories",
  "Suite",
  "Villa",
  "Penthouse",
  "Eco Cabin",
];

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room }: { room: (typeof ROOMS)[0] }) {
  return (
    <div className="flex items-stretch gap-0 bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden">
      {/* Room Image */}
      <div className="relative w-[200px] flex-shrink-0">
        <Image
          src={room.image}
          alt={room.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Room Info */}
      <div className="flex flex-1 items-center justify-between p-6 gap-6">
        {/* Left: type + name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-widest text-[#C05621] uppercase m-0 mb-1">
            {room.type} &bull; {room.roomNumber}
          </p>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-snug m-0 mb-3">
            {room.name}
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
              style={{ color: room.occupancy >= 80 ? "#2D7D5C" : "#C05621" }}
            >
              {room.occupancy}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0 mb-1">
              ADR
            </p>
            <p className="text-[22px] font-bold text-[#1A1A1A] leading-none m-0">
              ${room.adr.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-[#C05621] uppercase m-0 mb-1">
              RevPAR (Calculated)
            </p>
            <p className="text-[26px] font-bold text-[#1A1A1A] leading-none m-0">
              ${room.revpar.toFixed(2)}
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

  // Filter by category
  const filtered =
    selectedCategory === "All Categories"
      ? ROOMS
      : ROOMS.filter((r) => r.type === selectedCategory);

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
            {/* Room Category dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DDD8] rounded-xl text-[13px] text-[#1A1A1A] shadow-sm hover:border-[#C05621] transition-colors"
              >
                <span className="text-[10px] font-semibold text-[#9E7B6A] uppercase tracking-wider">
                  Room Category
                </span>
                <span className="font-medium">{selectedCategory}</span>
                <ChevronDown size={14} color="#9E7B6A" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[#E8DDD8] rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                  {ROOM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#FFF3EE] text-[#C05621] font-semibold"
                          : "text-[#1A1A1A] hover:bg-[#FAF5F2]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DDD8] rounded-xl text-[13px] text-[#6B4A3A] shadow-sm">
              <Calendar size={14} color="#9E7B6A" />
              <span>Oct 01 – Oct 31, 2023</span>
            </div>
          </div>
        </div>

        {/* ── Room Cards ── */}
        <div className="flex flex-col gap-4">
          {pageRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#F0EBE7] p-12 text-center">
              <p className="text-[#9E7B6A] text-[14px]">
                No rooms found for selected category.
              </p>
            </div>
          ) : (
            pageRooms.map((room) => <RoomCard key={room.id} room={room} />)
          )}
        </div>

        {/* ── Footer: Count + Pagination ── */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
            Showing {pageRooms.length} of {filtered.length} high-yield units
          </p>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-[#E8DDD8] flex items-center justify-center bg-white disabled:opacity-40 hover:bg-[#FAF5F2] transition-colors"
            >
              <ChevronLeft size={16} color="#6B4A3A" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-[13px] font-semibold border transition-colors ${
                  currentPage === page
                    ? "bg-[#7B2504] text-white border-[#7B2504]"
                    : "bg-white text-[#1A1A1A] border-[#E8DDD8] hover:bg-[#FAF5F2]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-lg border border-[#E8DDD8] flex items-center justify-center bg-white disabled:opacity-40 hover:bg-[#FAF5F2] transition-colors"
            >
              <ChevronRight size={16} color="#6B4A3A" />
            </button>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
