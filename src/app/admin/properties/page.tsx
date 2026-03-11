"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";

// ─── Types ────────────────────────────────────────────────────────────────────
type PropertyStatus = "Pending" | "Under Review";

interface PropertyEntry {
  id: string;
  name: string;
  pvId: string;
  image: string;
  ownerName: string;
  ownerRole: string;
  ownerColor: string;
  ownerInitial: string;
  submittedDate: string;
  submittedTime: string;
  status: PropertyStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROPERTIES: PropertyEntry[] = [
  {
    id: "1",
    name: "City Loft, NY",
    pvId: "#PV-2935",
    image: "/images/properties/property-1.jpg",
    ownerName: "Harvey Specter",
    ownerRole: "Owner",
    ownerColor: "#f4a261",
    ownerInitial: "H",
    submittedDate: "Oct 21, 2023",
    submittedTime: "11:15 AM",
    status: "Pending",
  },
  {
    id: "2",
    name: "Ocean View Apt",
    pvId: "#PV-2937",
    image: "/images/properties/property-2.jpg",
    ownerName: "Mike Ross",
    ownerRole: "Owner",
    ownerColor: "#2f80ed",
    ownerInitial: "M",
    submittedDate: "Oct 23, 2023",
    submittedTime: "4:15 PM",
    status: "Under Review",
  },
  {
    id: "3",
    name: "Mountain Retreat",
    pvId: "#PV-2936",
    image: "/images/properties/property-3.jpg",
    ownerName: "Jessica Pearson",
    ownerRole: "Owner",
    ownerColor: "#e84393",
    ownerInitial: "J",
    submittedDate: "Oct 22, 2023",
    submittedTime: "09:30 AM",
    status: "Pending",
  },
  {
    id: "4",
    name: "City Loft, NY",
    pvId: "#PV-2935",
    image: "/images/properties/property-4.jpg",
    ownerName: "Harvey Specter",
    ownerRole: "Owner",
    ownerColor: "#f4a261",
    ownerInitial: "H",
    submittedDate: "Oct 21, 2023",
    submittedTime: "11:15 AM",
    status: "Pending",
  },
];

const PAGE_SIZE = 4;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PropertyStatus }) {
  const isUnderReview = status === "Under Review";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        isUnderReview ? "text-[#16A34A]" : "text-[#F59E0B]"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isUnderReview ? "bg-[#16A34A]" : "bg-[#F59E0B]"
        }`}
      />
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PropertyStatus>(
    "Pending",
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = PROPERTIES.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.pvId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goPage = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  const startIndex =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const statusOptions: ("All" | PropertyStatus)[] = [
    "All",
    "Pending",
    "Under Review",
  ];

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-5">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-[24px] font-bold text-[#1A1A1A] m-0">
            Property Verification Queue
          </h1>
          <p className="text-[14px] text-[#9E7B6A] mt-1 m-0">
            Manage and review property onboarding requests efficiently.
          </p>
        </div>

        {/* ── Search + Filter ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-105">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D1D5DB] pointer-events-none"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by property name, owner or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-[1.5px] border-[#E8DDD8] bg-white text-[13px] text-[#1A1A1A] outline-none focus:border-[#C05621] transition-colors placeholder:text-[#C4B5AC]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-[#F6F8F7] rounded-xl border border-[#E8DDD8] overflow-hidden">
              {statusOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setStatusFilter(opt);
                    setCurrentPage(1);
                  }}
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
        </div>

        {/* ── Property Table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#F6F8F7]">
                  {["PROPERTY", "OWNER", "SUBMITTED", "STATUS", "ACTION"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-left text-[11px] font-bold text-[#9E7B6A] tracking-wider uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[#9E7B6A] text-sm"
                    >
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  paged.map((property) => (
                    <tr
                      key={property.id + property.pvId}
                      className="border-t border-[#F0EBE7] transition-colors hover:bg-[#f5efec]"
                    >
                      {/* Property */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={property.image}
                              alt={property.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="m-0 font-semibold text-[13px] text-[#1A1A1A]">
                              {property.name}
                            </p>
                            <p className="m-0 text-[11px] text-[#9E7B6A]">
                              ID: {property.pvId}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Owner */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                            style={{ backgroundColor: property.ownerColor }}
                          >
                            {property.ownerInitial}
                          </div>
                          <div>
                            <p className="m-0 font-semibold text-[13px] text-[#1A1A1A]">
                              {property.ownerName}
                            </p>
                            <p className="m-0 text-[11px] text-[#9E7B6A]">
                              {property.ownerRole}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Submitted */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="m-0 text-[13px] text-[#1A1A1A]">
                          {property.submittedDate}
                        </p>
                        <p className="m-0 text-[11px] text-[#9E7B6A]">
                          {property.submittedTime}
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={property.status} />
                      </td>
                      {/* Action */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() =>
                            router.push("/admin/properties/property-details")
                          }
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

          {/* ── Pagination ── */}
          <div className="flex justify-between items-center px-5 py-3.5 border-t border-[#F0EBE7]">
            <span className="text-[13px] text-[#9E7B6A]">
              Showing <strong className="text-[#1A1A1A]">{startIndex}</strong>{" "}
              to <strong className="text-[#1A1A1A]">{endIndex}</strong> of{" "}
              <strong className="text-[#1A1A1A]">{filtered.length}</strong>{" "}
              entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3.5 py-1.5 rounded-lg border border-[#E8DDD8] bg-white text-[13px] font-medium ${
                  currentPage === 1
                    ? "cursor-not-allowed text-[#D1D5DB]"
                    : "cursor-pointer text-[#6B7280] hover:border-[#C05621] hover:text-[#C05621]"
                } transition-colors`}
              >
                Previous
              </button>
              <button
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3.5 py-1.5 rounded-lg border border-[#E8DDD8] bg-white text-[13px] font-medium ${
                  currentPage === totalPages
                    ? "cursor-not-allowed text-[#D1D5DB]"
                    : "cursor-pointer text-[#6B7280] hover:border-[#C05621] hover:text-[#C05621]"
                } transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
