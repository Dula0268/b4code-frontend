"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, QrCode, UtensilsCrossed, Home, CheckCircle, X, ChevronLeft, ChevronRight, AlertCircle, Loader } from "lucide-react";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import type { QRTab } from "@/store/staff/qr/staff-qr.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import StaffHeader from "@/components/staff/layout/staff-header";

const TAB_ICONS: Record<QRTab, React.ReactNode> = {
  Table: <UtensilsCrossed size={13} />,
  Room: <Home size={13} />,
};

const TYPE_COLORS: Record<string, string> = {
  Table: "bg-[rgba(192,86,33,0.08)] text-[#C05621]",
  Room: "bg-[rgba(45,125,92,0.08)] text-[#2D7D5C]",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Table: <UtensilsCrossed size={16} className="text-[#C05621]" />,
  Room: <Home size={16} className="text-[#2D7D5C]" />,
};

const PER_PAGE = 5;

export default function QrList({ propertyId }: { propertyId: number }) {
  const qrs = useStaffQRStore((s) => s.qrs);
  const toggleStatus = useStaffQRStore((s) => s.toggleStatus);
  const deleteQR = useStaffQRStore((s) => s.deleteQR);
  const fetchQRs = useStaffQRStore((s) => s.fetchQRs);
  const successMsg = useStaffQRStore((s) => s.successMsg);
  const setSuccess = useStaffQRStore((s) => s.setSuccess);
  const loading = useStaffQRStore((s) => s.loading);
  const error = useStaffQRStore((s) => s.error);
  const setError = useStaffQRStore((s) => s.setError);

  const [tab, setTab] = useState<QRTab>("Table");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);

  // Fetch QR codes on component mount
  useEffect(() => {
    if (propertyId) {
      fetchQRs(propertyId, 0, 50); // Fetch with larger page size for client-side filtering
    }
  }, [propertyId, fetchQRs]);

  // Handle success message auto-dismiss
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

  // Handle error message auto-dismiss
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error, setError]);

  const filtered = useMemo(() => {
    let list = qrs.filter((q) => q.tab === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.location.toLowerCase().includes(q));
    }
    return list;
  }, [qrs, tab, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleTabChange = (t: QRTab) => { setTab(t); setPage(0); };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus(id);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteQR = async (id: string) => {
    setQrToDelete(id);
  };

  const confirmDelete = async () => {
    if (!qrToDelete) return;
    try {
      await deleteQR(qrToDelete);
      setQrToDelete(null);
    } catch (err) {
      console.error("Failed to delete QR:", err);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <StaffHeader
        title="QR Management"
        subtitle="Manage and track guest QR codes"
        actions={
          <Button asChild size="sm" className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white hover:from-[#C05621] hover:to-[#99451A] shadow-md font-bold gap-2 transition-all" disabled={loading}>
            <Link href={`/staff/qr/new?propertyId=${propertyId}`}>
              <Plus size={16} /> Create QR
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col flex-1 min-h-0 px-6 py-4 gap-4 mt-[64px] overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 h-full">
      {/* Success banner */}
      {successMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(45,125,92,0.08)] border border-[rgba(45,125,92,0.2)] rounded-xl px-4 py-2 text-sm">
          <CheckCircle size={16} className="text-[#2D7D5C]" />
          <span className="text-[#1A1A1A] font-medium flex-1">{successMsg}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSuccess(null)}><X size={14} /></Button>
        </div>
      )}

      {/* Error / Info banner */}
      {error && (
        <div className={`flex-none flex items-center gap-2 rounded-2xl px-4 py-2 text-sm border ${
          error.includes("offline") || error.includes("Connection")
            ? "bg-[#FFF8F0] border-[#F0EBE7] text-[#C05621]"
            : "bg-[rgba(220,53,69,0.08)] border-[rgba(220,53,69,0.2)] text-red-500"
        }`}>
          <AlertCircle size={16} className={error.includes("offline") || error.includes("Connection") ? "text-[#C05621]" : "text-red-500"} />
          <span className="font-medium flex-1">
            {error.includes("offline") || error.includes("Connection") 
              ? "Viewing offline data. Changes will sync when connection is restored." 
              : error}
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-transparent" onClick={() => setError(null)}>
            <X size={14} className={error.includes("offline") || error.includes("Connection") ? "text-[#C05621]" : "text-red-500"} />
          </Button>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex bg-white/30 backdrop-blur-md border border-white/50 rounded-xl overflow-hidden p-1 gap-1 w-full sm:w-auto">
          {(["Table", "Room"] as QRTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold transition-colors ${
                tab === t ? "bg-white text-[#1A1A1A] shadow-sm rounded-lg" : "bg-transparent text-[#9E7B6A] hover:bg-white/50 rounded-lg"
              }`}
            >
              {TAB_ICONS[t]} {t}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E7B6A] z-10" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search contexts..." className="pl-9 h-10 text-xs rounded-xl border-white/50 bg-white/70 backdrop-blur-md shadow-sm font-semibold placeholder:text-[#9E7B6A] w-full" disabled={loading} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-0 overflow-hidden">
        {/* Loading indicator */}
        {loading && (
          <div className="flex-1 flex flex-col p-4 gap-4">
            <div className="grid grid-cols-[1fr_120px_100px_140px] gap-4 mb-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="flex-1 overflow-x-auto custom-scrollbar flex flex-col">
              <div className="min-w-[600px] flex-1 flex flex-col">
                {/* Table header */}
                <div className="flex-none grid grid-cols-[1fr_120px_100px_140px] gap-4 px-4 py-2 border-b border-[#F0EBE7] bg-white/50">
                  <span className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wider">Context Name</span>
                  <span className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wider">Type</span>
                  <span className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wider">Status</span>
                  <span className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wider text-right">Actions</span>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {paged.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-[#9E7B6A]">No QR contexts found.</p>
                    </div>
                  ) : (
                    paged.map((qr) => (
                      <div key={qr.id} className="grid grid-cols-[1fr_120px_100px_140px] gap-4 items-center px-4 py-3 border-b border-[#F0EBE7] last:border-b-0 hover:bg-[rgba(0,0,0,0.01)] transition-colors">
                        {/* Name */}
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(192,86,33,0.06)] flex items-center justify-center shrink-0">
                            {TYPE_ICONS[qr.type] || <QrCode size={16} className="text-[#C05621]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#1A1A1A] truncate">{qr.name}</p>
                            <p className="text-[10px] text-[#9E7B6A] truncate">{qr.location}</p>
                          </div>
                        </div>
                        {/* Type */}
                        <Badge variant="outline" className={`text-[9px] font-bold border-0 w-fit ${TYPE_COLORS[qr.type] ?? "bg-[rgba(0,0,0,0.04)] text-[#8A7568]"}`}>
                          {qr.type}
                        </Badge>
                        {/* Status */}
                        <Badge variant="outline" className={`text-[9px] font-bold border-0 w-fit ${
                          qr.status === "active" ? "bg-[rgba(45,125,92,0.08)] text-[#2D7D5C]" : "bg-[rgba(130,130,130,0.08)] text-[#9E7B6A]"
                        }`}>
                          {qr.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        {/* Actions */}
                        <div className="flex items-center gap-1 justify-end">
                          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[#9E7B6A]">
                            <Link href={`/staff/qr/${qr.id}`}><QrCode size={13} /></Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[#9E7B6A]">
                            <Link href={`/staff/qr/${qr.id}/edit`}><Pencil size={13} /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={() => handleDeleteQR(qr.id)} disabled={loading}>
                            <Trash2 size={13} />
                          </Button>
                          <Switch
                            checked={qr.status === "active"}
                            onCheckedChange={() => handleToggleStatus(qr.id)}
                            disabled={loading}
                            className="data-[state=checked]:bg-[#2D7D5C] data-[state=unchecked]:bg-[#D4C4B5] ml-1"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex-none flex items-center justify-between px-4 py-2 border-t border-[#F0EBE7] bg-white/50">
                <p className="text-[10px] text-[#9E7B6A] hidden sm:block">
                  Showing <span className="font-bold text-[#1A1A1A]">{page * PER_PAGE + 1}</span> to <span className="font-bold text-[#1A1A1A]">{Math.min((page + 1) * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-[#1A1A1A]">{filtered.length}</span> results
                </p>
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                  <Button variant="outline" size="icon" className="h-6 w-6" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={12} /></Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={page === i ? "default" : "outline"}
                        size="icon"
                        className={`h-6 w-6 text-[10px] ${page === i ? "bg-[#C05621] text-white hover:bg-[#C05621]/90" : ""}`}
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="icon" className="h-6 w-6" disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={12} /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <DeleteConfirmationDialog
        isOpen={!!qrToDelete}
        onClose={() => setQrToDelete(null)}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete QR Context?"
        description="This action cannot be undone. Guests will no longer be able to order using this QR code."
      />
        </div>
      </div>
    </div>
  );
}
