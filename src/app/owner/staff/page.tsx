"use client";

import { useState, useEffect, useCallback } from "react";
import OwnerHeader from "@/components/owner/layout/owner-header";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import { ownerStaffApi, PendingStaffMember } from "@/api/owner/staff.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import clsx from "clsx";

export default function OwnerStaffPage() {
  const { ready } = useOwnerGuard();

  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    member: PendingStaffMember;
  } | null>(null);

  const fetchPendingStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ownerStaffApi.getPendingStaff();
      setPendingStaff(data || []);
    } catch (err) {
      console.error("Failed to load pending staff:", err);
      toast.error("Failed to fetch pending staff requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      fetchPendingStaff();
    }
  }, [ready, fetchPendingStaff]);

  const handleApprove = async (member: PendingStaffMember) => {
    setProcessingId(member.id);
    try {
      await ownerStaffApi.approveStaff(member.id);
      toast.success(`${member.firstName} ${member.lastName} has been approved as ${member.role}!`);
      setPendingStaff((prev) => prev.filter((item) => item.id !== member.id));
      setConfirmAction(null);
    } catch (err) {
      console.error("Approve failed:", err);
      toast.error("Failed to approve staff member. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (member: PendingStaffMember) => {
    setProcessingId(member.id);
    try {
      await ownerStaffApi.rejectStaff(member.id);
      toast.success(`Registration request for ${member.firstName} ${member.lastName} was rejected.`);
      setPendingStaff((prev) => prev.filter((item) => item.id !== member.id));
      setConfirmAction(null);
    } catch (err) {
      console.error("Reject failed:", err);
      toast.error("Failed to reject staff request.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredStaff = pendingStaff.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return (
      fullName.includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.propertyName?.toLowerCase().includes(query) ||
      m.role?.toLowerCase().includes(query)
    );
  });

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf7f5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#953002]" />
          <p className="text-sm font-semibold text-neutral-600">Loading Staff Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f5]">
      <OwnerHeader
        title="Staff Approvals & Team"
        subtitle="Review, approve, and manage staff members registered to your properties."
      />

      <main className="flex-1 p-4 sm:p-6 md:p-8 mt-[64px] max-w-6xl mx-auto w-full space-y-6">
        
        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-black text-neutral-900 mt-0.5">{pendingStaff.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Security Control</p>
              <p className="text-xs font-semibold text-neutral-700 mt-0.5">Owner Authorization Required</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#953002]/10 text-[#953002] flex items-center justify-center shrink-0">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Role Assignment</p>
              <p className="text-xs font-semibold text-neutral-700 mt-0.5">Reception, Manager & Support</p>
            </div>
          </div>
        </div>

        {/* Action Header & Search */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                <Users className="text-[#953002]" size={20} />
                Pending Staff Applications
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Staff members who registered selecting your properties and verified their email address.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search by name, role, property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-xs rounded-xl bg-neutral-50 border-neutral-200 focus-visible:ring-1 focus-visible:ring-[#953002]/30"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchPendingStaff}
                disabled={loading}
                className="h-10 px-3 rounded-xl border-neutral-200 hover:bg-neutral-50 text-neutral-700 shrink-0 cursor-pointer"
                title="Refresh requests"
              >
                <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Pending Staff List */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#953002]" />
              <p className="text-xs font-bold text-neutral-500">Checking pending staff requests...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-16 border-2 border-dashed border-neutral-200/80 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-neutral-50/50">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">All Caught Up!</h3>
              <p className="text-xs text-neutral-500 max-w-md mt-1 leading-relaxed">
                {searchQuery
                  ? "No staff applications matched your search query."
                  : "There are no pending staff applications for your properties at this time. When a staff member signs up and chooses one of your properties, you can approve or reject them here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredStaff.map((member) => {
                const isProcessing = processingId === member.id;
                const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() || "S";

                return (
                  <div
                    key={member.id}
                    className="border border-neutral-200/90 hover:border-[#953002]/30 rounded-2xl p-5 bg-white shadow-xs transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Top member header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#953002]/10 text-[#953002] font-black text-sm flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-neutral-900">
                              {member.firstName} {member.lastName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#953002]/10 text-[#953002] text-[10px] font-extrabold uppercase">
                                {member.role || "Staff Member"}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                Awaiting Approval
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property & Contact Details */}
                      <div className="bg-neutral-50/80 rounded-xl p-3 space-y-1.5 text-xs text-neutral-600 border border-neutral-100">
                        <div className="flex items-center gap-2 text-neutral-800 font-semibold truncate">
                          <Building2 size={13} className="text-[#953002] shrink-0" />
                          <span className="truncate">{member.propertyName || "Assigned Property"}</span>
                        </div>

                        <div className="flex items-center gap-2 truncate">
                          <Mail size={13} className="text-neutral-400 shrink-0" />
                          <a href={`mailto:${member.email}`} className="truncate hover:underline text-neutral-600">
                            {member.email}
                          </a>
                        </div>

                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-neutral-400 shrink-0" />
                            <a href={`tel:${member.phone}`} className="hover:underline text-neutral-600">
                              {member.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <Button
                        type="button"
                        onClick={() => setConfirmAction({ type: "approve", member })}
                        disabled={isProcessing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 size={13} className="animate-spin mr-1.5" />
                        ) : (
                          <UserCheck size={14} className="mr-1.5" />
                        )}
                        Approve Staff
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmAction({ type: "reject", member })}
                        disabled={isProcessing}
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs h-9 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 size={13} className="animate-spin mr-1.5" />
                        ) : (
                          <UserX size={14} className="mr-1.5" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Guidance Box */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 flex items-start gap-3 shadow-sm">
          <AlertCircle size={18} className="text-[#953002] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-neutral-600">
            <p className="font-bold text-neutral-900">How do staff permissions work?</p>
            <p className="leading-relaxed">
              When approved, staff members gain access to the Staff Portal to manage check-ins, view reservations, and process orders strictly for the property they are assigned to. You can revoke access at any time.
            </p>
          </div>
        </div>

      </main>

      {/* ── Confirmation Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  confirmAction.type === "approve"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                )}
              >
                {confirmAction.type === "approve" ? <UserCheck size={20} /> : <UserX size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {confirmAction.type === "approve" ? "Approve Staff Member?" : "Reject Staff Application?"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {confirmAction.member.firstName} {confirmAction.member.lastName}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              {confirmAction.type === "approve"
                ? `Are you sure you want to approve ${confirmAction.member.firstName} ${confirmAction.member.lastName} as "${confirmAction.member.role}" for ${confirmAction.member.propertyName}? They will immediately be granted staff portal login access.`
                : `Are you sure you want to reject ${confirmAction.member.firstName} ${confirmAction.member.lastName}'s staff application for ${confirmAction.member.propertyName}? Their login will be blocked.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmAction(null)}
                disabled={processingId !== null}
                className="h-10 px-4 rounded-xl text-xs font-bold border-neutral-200 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() =>
                  confirmAction.type === "approve"
                    ? handleApprove(confirmAction.member)
                    : handleReject(confirmAction.member)
                }
                disabled={processingId !== null}
                className={clsx(
                  "h-10 px-5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer",
                  confirmAction.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {processingId !== null ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                    Processing...
                  </>
                ) : confirmAction.type === "approve" ? (
                  "Confirm Approval"
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
