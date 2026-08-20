"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import { ArrowLeft, Scale, Wallet, FileWarning } from "lucide-react";
import DisputesTable from "@/components/admin/moderation/disputes/disputes-table";

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<"REFUNDS" | "COMPLAINTS">("REFUNDS");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/admin/moderation"
            className="flex items-center gap-1.5 text-sm text-[#9E7B6A] hover:text-[#C05621] w-fit no-underline font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Moderation
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0 flex items-center gap-3">
                <Scale className="text-[#C05621]" size={28} />
                Dispute Resolution
              </h1>
              <p className="text-[13px] text-[#9E7B6A] mt-1 mb-0">
                Manage guest refund requests and handle property complaints.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 border-b-2 border-[#F0EBE7]">
          <button
            onClick={() => setActiveTab("REFUNDS")}
            className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium border-b-[3px] -mb-0.5 bg-transparent cursor-pointer transition-colors ${
              activeTab === "REFUNDS"
                ? "text-[#C05621] border-[#C05621] font-semibold"
                : "text-[#9E7B6A] border-transparent hover:text-[#C05621]"
            }`}
          >
            <Wallet size={16} />
            Refund Requests
          </button>
          
          <button
            onClick={() => setActiveTab("COMPLAINTS")}
            className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium border-b-[3px] -mb-0.5 bg-transparent cursor-pointer transition-colors ${
              activeTab === "COMPLAINTS"
                ? "text-[#C05621] border-[#C05621] font-semibold"
                : "text-[#9E7B6A] border-transparent hover:text-[#C05621]"
            }`}
          >
            <FileWarning size={16} />
            Guest Complaints
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E8DDD8] overflow-hidden">
          <DisputesTable category={activeTab === "COMPLAINTS" ? "COMPLAIN" : "REFUND"} />
        </div>
      </div>
    </AdminPageLayout>
  );
}
