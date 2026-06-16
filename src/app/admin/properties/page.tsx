"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import { useAdminPropertiesStore } from "@/store/admin/properties/properties.store";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name?: string) {
  if (!name) return "#9E7B6A";
  const colors = [
    "#C05621",
    "#2563EB",
    "#7C3AED",
    "#059669",
    "#DC2626",
    "#0891B2",
    "#CA8A04",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    APPROVED:     { color: "text-[#16A34A]", bg: "bg-[#16A34A]", label: "Approved" },
    UNDER_REVIEW: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]", label: "Under Review" },
    REJECTED:     { color: "text-[#DC2626]", bg: "bg-[#DC2626]", label: "Rejected" },
    PENDING:      { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]", label: "Pending" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.color}`}>
      <span className={`w-2 h-2 rounded-full ${s.bg}`} />
      {s.label}
    </span>
  );
}

// ─── Property Thumbnail ───────────────────────────────────────────────────────
function PropertyThumb({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
        <Image src={src} alt={alt} fill sizes="48px" className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
      <Building2 className="text-[#C4B5AB]" size={20} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const {
    properties,
    propertiesTotalElements,
    propertiesTotalPages,
    fetchProperties,
    loading,
  } = useAdminPropertiesStore();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch on filter change
  useEffect(() => {
    fetchProperties({
      page: currentPage - 1,
      size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status:
        statusFilter === "All"
          ? undefined
          : statusFilter.toUpperCase().replace(/\s+/g, "_"),
    });
  }, [fetchProperties, currentPage, debouncedSearch, statusFilter]);

  const goPage = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(propertiesTotalPages, p)));

  const startIndex = propertiesTotalElements === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, propertiesTotalElements);

  const statusOptions = ["All", "Pending", "Under Review", "Approved", "Rejected"];

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-[#1A1A1A] m-0">Properties</h1>
          <p className="text-[14px] text-[#9E7B6A] mt-1 m-0">
            Manage all platform properties — review, approve or reject listings.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D1D5DB] pointer-events-none"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, owner, city or ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-[1.5px] border-[#E8DDD8] bg-white text-[13px] text-[#1A1A1A] outline-none focus:border-[#C05621] transition-colors placeholder:text-[#C4B5AC]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#F6F8F7] rounded-xl border border-[#E8DDD8] overflow-hidden">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => { setStatusFilter(opt); setCurrentPage(1); }}
                className={`px-4 py-2 text-[13px] font-semibold border-none cursor-pointer transition-colors ${
                  statusFilter === opt
                    ? "bg-[#16A34A] text-white"
                    : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
          {loading && properties.length === 0 && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#C05621]" size={32} />
            </div>
          )}

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#F6F8F7]">
                  {["PROPERTY", "OWNER", "SUBMITTED", "STATUS", "ACTION"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[11px] font-bold text-[#9E7B6A] tracking-wider uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && properties.length > 0 && (
                  <tr>
                    <td colSpan={6} className="py-2 text-center">
                      <Loader2 className="animate-spin text-[#C05621] mx-auto" size={20} />
                    </td>
                  </tr>
                )}
                {properties.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[#9E7B6A] text-sm">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-t border-[#F0EBE7] hover:bg-[#f5efec] transition-colors"
                    >
                      {/* Property */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <PropertyThumb
                            src={property.mainImageUrl}
                            alt={property.name}
                          />
                          <div>
                            <p className="m-0 font-semibold text-[13px] text-[#1A1A1A]">
                              {property.name}
                            </p>
                            <p className="m-0 text-[11px] text-[#9E7B6A]">
                              {`ID: ${property.id}`}
                              {property.city ? ` · ${property.city}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Owner */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                            style={{
                              backgroundColor: getColorForName(property.ownerName),
                            }}
                          >
                            {getInitials(property.ownerName)}
                          </div>
                          <div>
                            <p className="m-0 font-semibold text-[13px] text-[#1A1A1A]">
                              {property.ownerName ?? "—"}
                            </p>
                            <p className="m-0 text-[11px] text-[#9E7B6A]">Owner</p>
                          </div>
                        </div>
                      </td>
                      {/* Submitted */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {property.createdAt ? (
                          <>
                            <p className="m-0 text-[13px] text-[#1A1A1A]">
                              {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                            <p className="m-0 text-[11px] text-[#9E7B6A]">
                              {new Date(property.createdAt).toLocaleTimeString()}
                            </p>
                          </>
                        ) : (
                          <p className="m-0 text-[13px] text-[#9E7B6A]">—</p>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={property.status} />
                      </td>
                      {/* Action */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => router.push(`/admin/properties/${property.id}`)}
                          className="text-[13px] font-semibold text-[#6B7280] bg-transparent border-none cursor-pointer hover:text-[#C05621] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {propertiesTotalPages > 0 && (
            <div className="flex justify-between items-center px-5 py-3.5 border-t border-[#F0EBE7]">
              <span className="text-[13px] text-[#9E7B6A]">
                Showing <strong className="text-[#1A1A1A]">{startIndex}</strong> to{" "}
                <strong className="text-[#1A1A1A]">{endIndex}</strong> of{" "}
                <strong className="text-[#1A1A1A]">{propertiesTotalElements}</strong> properties
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-[#E8DDD8] bg-white text-[13px] font-medium ${
                    currentPage === 1
                      ? "cursor-not-allowed text-[#D1D5DB]"
                      : "cursor-pointer text-[#6B7280] hover:border-[#C05621] hover:text-[#C05621]"
                  } transition-colors`}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-[13px] text-[#6B7280] px-2">
                  Page {currentPage} / {propertiesTotalPages}
                </span>
                <button
                  onClick={() => goPage(currentPage + 1)}
                  disabled={currentPage === propertiesTotalPages}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-[#E8DDD8] bg-white text-[13px] font-medium ${
                    currentPage === propertiesTotalPages
                      ? "cursor-not-allowed text-[#D1D5DB]"
                      : "cursor-pointer text-[#6B7280] hover:border-[#C05621] hover:text-[#C05621]"
                  } transition-colors`}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}
