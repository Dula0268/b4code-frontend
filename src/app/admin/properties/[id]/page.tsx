"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Home,
  BedDouble,
  DollarSign,
  ArrowRight,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import PaymentModel from "@/components/features/admin/properties/payment-model";
import HostInformation from "@/components/features/admin/properties/host-information";
import { useAdminPropertiesStore } from "@/store/admin/properties/properties.store";

// ─── Document Card ────────────────────────────────────────────────────────────
function DocumentCard({
  image,
  label,
  type,
  updated,
  size,
}: {
  image: string;
  label: string;
  type: string;
  updated: string;
  size: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#E8DDD8]">
      <div className="relative w-full h-40 bg-[#F3F4F6] flex items-center justify-center">
        {image ? (
          <Image src={image} alt={label} fill className="object-cover" />
        ) : (
          <span className="text-[#9E7B6A] text-xs">No preview available</span>
        )}
        {/* File type badge */}
        <span className="absolute bottom-2 right-2 bg-[#1A1A1A]/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {type}
        </span>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="m-0 text-[13px] font-semibold text-[#1A1A1A]">
            {label}
          </p>
          <p className="m-0 text-[11px] text-[#9E7B6A]">
            {updated} • {size}
          </p>
        </div>
        <button
          className="bg-transparent border-none cursor-pointer text-[#9E7B6A] hover:text-[#C05621] transition-colors flex"
          onClick={() => {
            if (image) window.open(image, "_blank");
          }}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Property Detail Card ─────────────────────────────────────────────────────
function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-[#E8DDD8] rounded-xl p-4 flex flex-col gap-2">
      <div className="text-[#6B7280]">{icon}</div>
      <div>
        <p className="m-0 text-[14px] font-bold text-[#1A1A1A]">{label}</p>
        <p className="m-0 text-[12px] text-[#9E7B6A]">{value}</p>
      </div>
    </div>
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "An unexpected error occurred.";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const {
    selectedProperty,
    getPropertyById,
    loading,
    actionLoading,
    approveProperty,
    rejectProperty,
    markUnderReview,
  } = useAdminPropertiesStore();

  useEffect(() => {
    if (id) {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        getPropertyById(numericId);
      }
    }
  }, [id, getPropertyById]);

  if (loading || !selectedProperty) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      </AdminPageLayout>
    );
  }

  const handleApprove = async () => {
    if (confirm("Are you sure you want to approve this property?")) {
      try {
        await approveProperty(selectedProperty.id);
      } catch (e: unknown) {
        alert(getErrorMessage(e) || "Failed to approve property.");
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectProperty(selectedProperty.id, reason);
      } catch (e: unknown) {
        alert(getErrorMessage(e) || "Failed to reject property.");
      }
    }
  };

  const handleUnderReview = async () => {
    try {
      await markUnderReview(selectedProperty.id);
    } catch (e: unknown) {
      alert(getErrorMessage(e) || "Failed to mark under review.");
    }
  };

  const isPending =
    selectedProperty.status === "Pending" ||
    selectedProperty.status === "PENDING";
  const isUnderReview =
    selectedProperty.status === "Under Review" ||
    selectedProperty.status === "UNDER_REVIEW";
  const isActionRequired = isPending || isUnderReview;

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6 pb-24 relative">
        {actionLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader2 className="animate-spin text-[#C05621]" size={48} />
          </div>
        )}
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => router.push("/admin/properties")}
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-[#9E7B6A] text-sm p-0 hover:text-[#1A1A1A] transition-colors"
          >
            Back
          </button>
          <ChevronRight size={14} className="text-[#D1D5DB]" />
          <span className="text-[#C05621] font-semibold">
            {selectedProperty.name}
          </span>
        </div>

        {/* ── Title ── */}
        <div className="border-b border-[#F0EBE7] pb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[24px] font-bold text-[#1A1A1A] m-0">
              {selectedProperty.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                isUnderReview
                  ? "bg-[#DBEAFE] text-[#1E40AF]"
                  : isPending
                    ? "bg-[#FEF3C7] text-[#92400E]"
                    : selectedProperty.status === "Approved"
                      ? "bg-[#D1FAE5] text-[#065F46]"
                      : "bg-[#FEE2E2] text-[#991B1B]"
              }`}
            >
              {selectedProperty.status}
            </span>
          </div>
          <p className="text-[13px] text-[#9E7B6A] mt-1.5 m-0">
            Submitted on{" "}
            {new Date(selectedProperty.submissionDate).toLocaleDateString()} •
            ID: #{selectedProperty.id}
          </p>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-[1fr_300px] gap-8 items-start">
          {/* ── Left Column ── */}
          <div>
            {/* Property Details Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1A1A1A] m-0">
                Property Details
              </h2>
            </div>

            {/* Detail Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <DetailCard
                icon={<MapPin size={18} />}
                label="Address"
                value={selectedProperty.location || "N/A"}
              />
              <DetailCard icon={<Home size={18} />} label="Type" value="N/A" />
              <DetailCard
                icon={<BedDouble size={18} />}
                label="Configuration"
                value="N/A"
              />
              <DetailCard
                icon={
                  <div className="flex items-center gap-1">
                    <DollarSign size={18} />
                    <ArrowRight size={14} />
                  </div>
                }
                label="Base Rate"
                value="N/A"
              />
            </div>

            {/* Payment Model */}
            <PaymentModel />

            {/* Host Information */}
            <HostInformation />
          </div>

          {/* ── Right Column: Documents ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1A1A1A] m-0">
                Documents
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6] text-white text-[11px] font-bold">
                1 File
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <DocumentCard
                image={selectedProperty.documentUrl || ""}
                label="Property Document"
                type="DOC"
                updated="Submitted with application"
                size="Unknown"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Verification Bar ── */}
      {isActionRequired && (
        <div className="fixed bottom-0 left-65 right-0 bg-white border-t-2 border-[#E8DDD8] px-7 py-4 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div>
            <p className="m-0 text-[10px] font-bold text-[#9E7B6A] tracking-wider uppercase">
              VERIFICATION STATUS
            </p>
            <p className="m-0 text-[13px] font-bold text-[#DC2626]">
              Action Required
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="text-[14px] font-semibold text-[#DC2626] bg-transparent border-none cursor-pointer hover:underline px-2 disabled:opacity-50"
            >
              Reject
            </button>
            {isPending && (
              <button
                onClick={handleUnderReview}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-[1.5px] border-[#E8DDD8] bg-white text-[14px] font-semibold text-[#1A1A1A] cursor-pointer hover:border-[#C05621] hover:text-[#C05621] transition-colors disabled:opacity-50"
              >
                Mark Under Review
              </button>
            )}
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#15803D] transition-colors shadow-[0_2px_10px_rgba(22,163,74,0.3)] disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Approve Property
            </button>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
