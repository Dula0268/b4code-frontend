"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Home,
  BedDouble,
  DollarSign,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import PaymentModel from "@/components/features/admin/properties/payment-model";
import HostInformation from "@/components/features/admin/properties/host-information";

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
      <div className="relative w-full h-[160px]">
        <Image src={image} alt={label} fill className="object-cover" />
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
        <button className="bg-transparent border-none cursor-pointer text-[#9E7B6A] hover:text-[#C05621] transition-colors flex">
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyDetailsPage() {
  const router = useRouter();

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6 pb-24">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => router.push("/admin/properties")}
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-[#9E7B6A] text-sm p-0 hover:text-[#1A1A1A] transition-colors"
          >
            Back
          </button>
          <ChevronRight size={14} className="text-[#D1D5DB]" />
          <span className="text-[#C05621] font-semibold">Sunflower Villa</span>
        </div>

        {/* ── Title ── */}
        <div className="border-b border-[#F0EBE7] pb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[24px] font-bold text-[#1A1A1A] m-0">
              Sunflower Villa - 4BR Luxury Stay
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[12px] font-bold">
              Pending Review
            </span>
          </div>
          <p className="text-[13px] text-[#9E7B6A] mt-1.5 m-0">
            Submitted on Oct 12, 2023 • ID: #99283
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
              <button className="text-[13px] font-semibold text-[#C05621] bg-transparent border-none cursor-pointer hover:underline">
                Edit
              </button>
            </div>

            {/* Detail Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <DetailCard
                icon={<MapPin size={18} />}
                label="Address"
                value="123 Palm Ave, Miami, FL 33101"
              />
              <DetailCard
                icon={<Home size={18} />}
                label="Type"
                value="Villa / Entire Home"
              />
              <DetailCard
                icon={<BedDouble size={18} />}
                label="Configuration"
                value="4 Bedrooms, 3 Bathrooms"
              />
              <DetailCard
                icon={
                  <div className="flex items-center gap-1">
                    <DollarSign size={18} />
                    <ArrowRight size={14} />
                  </div>
                }
                label="Base Rate"
                value="LKR 450/night"
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
                3 Files
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <DocumentCard
                image="/images/properties/business-license.png"
                label="Business License"
                type="PDF"
                updated="Updated 2 days ago"
                size="1.2 MB"
              />
              <DocumentCard
                image="/images/properties/govt-id-front.png"
                label="Govt ID Front"
                type="JPG"
                updated="Updated 2 days ago"
                size="3.5 MB"
              />
              <DocumentCard
                image="/images/properties/utility-bill.png"
                label="Utility Bill Proof"
                type="PDF"
                updated="Updated 1 week ago"
                size="0.8 MB"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Verification Bar ── */}
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
          <button className="text-[14px] font-semibold text-[#DC2626] bg-transparent border-none cursor-pointer hover:underline px-2">
            Reject
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-[1.5px] border-[#E8DDD8] bg-white text-[14px] font-semibold text-[#1A1A1A] cursor-pointer hover:border-[#C05621] hover:text-[#C05621] transition-colors">
            Request More Info
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#15803D] transition-colors shadow-[0_2px_10px_rgba(22,163,74,0.3)]">
            <CheckCircle2 size={16} />
            Approve Property
          </button>
        </div>
      </div>
    </AdminPageLayout>
  );
}
