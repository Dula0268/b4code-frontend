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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAFAFA] to-[#F5F2F0] border border-[#E8DDD8] p-8 shadow-sm">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C05621]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#953002]/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <Link 
              href="/admin/moderation"
              className="flex items-center gap-1.5 text-sm text-[#9E7B6A] hover:text-[#C05621] w-fit no-underline font-semibold transition-all hover:-translate-x-1"
            >
              <ArrowLeft size={16} />
              Back to Moderation
            </Link>
            
            <div>
              <h1 className="text-[28px] font-extrabold text-[#1A1A1A] leading-tight m-0 flex items-center gap-3 drop-shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C05621] to-[#953002] flex items-center justify-center text-white shadow-md">
                  <Scale size={24} />
                </div>
                Dispute Resolution
              </h1>
              <p className="text-[15px] text-[#6B7280] mt-2 mb-0 font-medium max-w-2xl">
                Manage guest refund requests and handle property complaints efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-1.5 bg-[#F5F2F0] rounded-xl border border-[#E8DDD8]/60 inline-flex shadow-inner">
            <button
              onClick={() => setActiveTab("REFUNDS")}
              className={`flex items-center gap-2 px-6 py-2.5 text-[14px] font-bold rounded-lg border-none cursor-pointer transition-all duration-300 ${
                activeTab === "REFUNDS"
                  ? "bg-white text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:bg-black/5"
              }`}
            >
              <Wallet size={18} className={activeTab === "REFUNDS" ? "text-[#C05621]" : ""} />
              Refund Requests
            </button>
            
            <button
              onClick={() => setActiveTab("COMPLAINTS")}
              className={`flex items-center gap-2 px-6 py-2.5 text-[14px] font-bold rounded-lg border-none cursor-pointer transition-all duration-300 ${
                activeTab === "COMPLAINTS"
                  ? "bg-white text-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A] hover:bg-black/5"
              }`}
            >
              <FileWarning size={18} className={activeTab === "COMPLAINTS" ? "text-[#C05621]" : ""} />
              Guest Complaints
            </button>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-[#E8DDD8] overflow-hidden relative transition-all duration-300">
          <DisputesTable category={activeTab === "COMPLAINTS" ? "COMPLAIN" : "REFUND"} />
        </div>
      </div>
    </AdminPageLayout>
  );
}
