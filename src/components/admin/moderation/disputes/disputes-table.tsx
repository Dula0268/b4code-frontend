"use client";

import { useEffect, useState } from "react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";
import type { Dispute } from "@/api/admin/moderation.api";
import { Search, Filter, AlertCircle, Calendar } from "lucide-react";
import DisputeDetailsModal from "./dispute-details-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function DisputesTable({ category }: { category: "REFUND" | "COMPLAIN" }) {
  const { disputes, fetchDisputes, disputesLoading } = useAdminModerationStore();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [filterStatus, setFilterStatus] = useState<"OPEN" | "RESOLVED" | "ALL">("OPEN");

  useEffect(() => {
    fetchDisputes({
      page: 0,
      size: 20,
      isComplaint: category === "COMPLAIN",
      status: filterStatus === "ALL" ? undefined : filterStatus
    });
  }, [fetchDisputes, category, filterStatus]);

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "bg-green-100 text-green-700 border-green-200";
    if (status === "Action Required" || status === "Open") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (status === "Evidence Uploaded") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#E8DDD8] flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C05621] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search guest, property..." 
              className="pl-9 pr-4 py-2 border border-[#E8DDD8] rounded-xl text-[14px] focus:outline-none focus:ring-4 focus:ring-[#C05621]/10 focus:border-[#C05621] w-[260px] shadow-sm transition-all text-[#1A1A1A] bg-white placeholder:text-[#9E7B6A]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 text-slate-600 border-[#E8DDD8]">
                <Filter size={16} /> 
                {filterStatus === "ALL" ? "All Statuses" : filterStatus === "OPEN" ? "Open Cases" : "Resolved Cases"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white border border-[#E8DDD8] shadow-lg rounded-xl overflow-hidden p-1">
              <DropdownMenuItem className="cursor-pointer py-2 px-3 hover:bg-[#953002]/10 hover:text-[#953002] rounded-lg transition-colors" onClick={() => setFilterStatus("OPEN")}>Open Cases</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 px-3 hover:bg-[#953002]/10 hover:text-[#953002] rounded-lg transition-colors" onClick={() => setFilterStatus("RESOLVED")}>Resolved Cases</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 px-3 hover:bg-[#953002]/10 hover:text-[#953002] rounded-lg transition-colors" onClick={() => setFilterStatus("ALL")}>All Cases</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Showing {disputes.length} cases
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#FAFAF8] text-[#6B7280] font-semibold border-b border-[#E8DDD8]">
            <tr>
              <th className="px-5 py-3 font-medium">Case ID</th>
              <th className="px-5 py-3 font-medium">Guest & Property</th>
              <th className="px-5 py-3 font-medium">Reason / Severity</th>
              {category === "REFUND" && <th className="px-5 py-3 font-medium">Amount</th>}
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EBE7] bg-white">
            {disputesLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400">
                  <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-[#953002] border-t-transparent rounded-full animate-spin"/></div>
                  Loading cases...
                </td>
              </tr>
            ) : disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400">
                  <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                  No cases found in this category.
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute.id} onClick={() => setSelectedDispute(dispute)} className="hover:bg-[#FAFAF8] group cursor-pointer border-b border-[#F0EBE7] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] transition-all duration-300 relative z-0 hover:z-10">
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#953002] uppercase text-[11px] tracking-wider bg-[#953002]/10 px-2 py-1 rounded">
                      #{dispute.disputeId.replace('DSP-', '').split('-')[0]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{dispute.guestName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12}/> {dispute.propertyName}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-800">{dispute.reason || dispute.category}</div>
                    {category === "COMPLAIN" && dispute.severity && (
                      <div className={`text-[10px] uppercase font-bold mt-1 tracking-wider inline-block px-1.5 py-0.5 rounded ${dispute.severity.includes('immediate') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {dispute.severity}
                      </div>
                    )}
                  </td>
                  {category === "REFUND" && (
                    <td className="px-5 py-4 font-semibold text-[#1A1A1A]">
                      {dispute.amount}
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button 
                      onClick={() => setSelectedDispute(dispute)}
                      variant="outline"
                      size="sm"
                      className="border border-[#E8DDD8] text-[#1A1A1A] font-semibold hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-[#C05621] hover:to-[#953002] hover:shadow-[0_4px_12px_rgba(192,86,33,0.3)] transition-all rounded-lg"
                    >
                      Review Case
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DisputeDetailsModal 
        dispute={selectedDispute}
        isComplaint={category === "COMPLAIN"}
        onClose={() => setSelectedDispute(null)}
      />
    </div>
  );
}
