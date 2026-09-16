"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OwnerHeader from "@/components/owner/layout/owner-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import PropertyCard from "@/components/owner/properties/property-card";
import PropertyListEmpty from "@/components/owner/properties/property-list-empty";
import { useOwnerPropertiesStore } from "@/store/owner/owner-properties.store";
import { useOnboardingStore } from "@/store/owner/onboarding.store";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Rejected", value: "REJECTED" },
];
const PAGE_SIZE = 9;

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const { properties, totalPages, totalItems, isLoading, fetchProperties } = useOwnerPropertiesStore();
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 450);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    fetchProperties({ page: currentPage, size: PAGE_SIZE, search: debouncedSearch || undefined, status: statusFilter || undefined });
  }, [fetchProperties, currentPage, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (v: string) => { setStatusFilter(v); setCurrentPage(0); };
  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(0); };

  const startIndex = totalItems === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endIndex = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  return (
    <>
      <OwnerHeader title="My Properties" subtitle="Manage your listed properties" actions={<button onClick={() => { resetOnboarding(); router.push("/owner/properties/new"); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#953002] text-white text-[13px] font-bold hover:opacity-90 shadow-sm hover:-translate-y-0.5 transition-all"><Plus size={16} /> Add Property</button>} /> <main className="mt-[64px] p-6 lg:p-8 flex-1 w-full flex flex-col gap-6">
        

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-xs group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E7B6A] group-focus-within:text-[#953002] transition-colors pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or city…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] bg-white text-[13px] text-[#1A1A1A] outline-none focus:border-[#C05621] focus:ring-4 focus:ring-[#C05621]/10 transition-all shadow-sm placeholder:text-[#9E7B6A]"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FA] rounded-xl border border-[#E8DDD8] shadow-sm flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg border-none cursor-pointer transition-all duration-200 ${
                  statusFilter === tab.value
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1, 2, 3].map((i) => (<Skeleton key={i} className="h-[300px] w-full rounded-2xl" />))}</div>
        ) : properties.length === 0 ? (
          <PropertyListEmpty filtered={Boolean(statusFilter || debouncedSearch)} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[13px] text-[#9E7B6A]">
                  Showing <strong className="text-[#1A1A1A]">{startIndex}–{endIndex}</strong> of <strong className="text-[#1A1A1A]">{totalItems}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8DDD8] text-[13px] font-medium disabled:opacity-40 hover:border-[#C05621] hover:text-[#C05621] transition-colors"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="text-[13px] text-[#6B7280] px-2">{currentPage + 1} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8DDD8] text-[13px] font-medium disabled:opacity-40 hover:border-[#C05621] hover:text-[#C05621] transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main></>  );}
