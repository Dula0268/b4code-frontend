"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, QrCode, UtensilsCrossed, Home, TreePalm, Wine, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import type { QRTab } from "@/store/staff/qr/staff-qr.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TAB_ICONS: Record<QRTab, React.ReactNode> = {
  Table: <UtensilsCrossed size={13} />,
  Room: <Home size={13} />,
};

const TYPE_COLORS: Record<string, string> = {
  "Dining Table": "bg-[rgba(149,48,2,0.08)] text-[var(--brand-primary)]",
  Outdoor: "bg-[rgba(255,180,1,0.12)] text-[#b57d00]",
  Bar: "bg-[rgba(47,128,237,0.08)] text-[#2F80ED]",
  Room: "bg-[rgba(39,174,96,0.08)] text-[var(--state-success)]",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "Dining Table": <UtensilsCrossed size={16} className="text-[var(--brand-primary)]" />,
  Outdoor: <TreePalm size={16} className="text-[#b57d00]" />,
  Bar: <Wine size={16} className="text-[#2F80ED]" />,
  Room: <Home size={16} className="text-[var(--state-success)]" />,
};

const PER_PAGE = 5;

export default function QrList() {
  const qrs = useStaffQRStore((s) => s.qrs);
  const toggleStatus = useStaffQRStore((s) => s.toggleStatus);
  const deleteQR = useStaffQRStore((s) => s.deleteQR);
  const successMsg = useStaffQRStore((s) => s.successMsg);
  const setSuccess = useStaffQRStore((s) => s.setSuccess);

  const [tab, setTab] = useState<QRTab>("Table");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

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

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Success banner */}
      {successMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(39,174,96,0.08)] border border-[rgba(39,174,96,0.2)] rounded-[10px] px-4 py-2 text-sm">
          <CheckCircle size={16} className="text-[var(--state-success)]" />
          <span className="text-[var(--black-2)] font-medium flex-1">{successMsg}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSuccess(null)}><X size={14} /></Button>
        </div>
      )}

      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--black-2)] leading-tight">QR Management</h1>
          <p className="text-xs text-[var(--gray-3)] mt-0.5">QR List</p>
        </div>
        <Button asChild size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1.5 hover:bg-[var(--brand-primary)]/90">
          <Link href="/staff/qr/new">
            <Plus size={13} /> Create QR
          </Link>
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex border border-[var(--gray-5)] rounded-[8px] overflow-hidden">
          {(["Table", "Room"] as QRTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-colors ${
                tab === t ? "bg-[var(--brand-primary)] text-white" : "bg-white text-[var(--gray-2)] hover:bg-[rgba(0,0,0,0.02)]"
              }`}
            >
              {TAB_ICONS[t]} {t}
            </button>
          ))}
        </div>
        <div className="relative w-[220px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-4)] z-10" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search contexts..." className="pl-8 text-xs rounded-[8px] border-[var(--gray-5)]" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-[10px] border border-[var(--gray-5)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {/* Table header */}
        <div className="flex-none grid grid-cols-[1fr_120px_100px_140px] gap-4 px-4 py-2 border-b border-[var(--gray-5)]">
          <span className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wider">Context Name</span>
          <span className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wider">Type</span>
          <span className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wider">Status</span>
          <span className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {paged.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-[var(--gray-3)]">No QR contexts found.</p>
            </div>
          ) : (
            paged.map((qr) => (
              <div key={qr.id} className="grid grid-cols-[1fr_120px_100px_140px] gap-4 items-center px-4 py-3 border-b border-[var(--gray-5)] last:border-b-0 hover:bg-[rgba(0,0,0,0.01)] transition-colors">
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0">
                    {TYPE_ICONS[qr.type] || <QrCode size={16} className="text-[var(--brand-primary)]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--black-2)] truncate">{qr.name}</p>
                    <p className="text-[10px] text-[var(--gray-3)] truncate">{qr.location}</p>
                  </div>
                </div>
                {/* Type */}
                <Badge variant="outline" className={`text-[9px] font-bold border-0 w-fit ${TYPE_COLORS[qr.type] ?? "bg-[rgba(0,0,0,0.04)] text-[var(--gray-2)]"}`}>
                  {qr.type === "Dining Table" ? "Dining" : qr.type}
                </Badge>
                {/* Status */}
                <Badge variant="outline" className={`text-[9px] font-bold border-0 w-fit ${
                  qr.status === "active" ? "bg-[rgba(39,174,96,0.08)] text-[var(--state-success)]" : "bg-[rgba(130,130,130,0.08)] text-[var(--gray-3)]"
                }`}>
                  {qr.status === "active" ? "Active" : "Inactive"}
                </Badge>
                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[var(--gray-3)]">
                    <Link href={`/staff/qr/${qr.id}`}><QrCode size={13} /></Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[var(--gray-3)]">
                    <Link href={`/staff/qr/${qr.id}/edit`}><Pencil size={13} /></Link>
                  </Button>
                  <Switch
                    checked={qr.status === "active"}
                    onCheckedChange={() => toggleStatus(qr.id)}
                    className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-none flex items-center justify-between px-4 py-2 border-t border-[var(--gray-5)]">
            <p className="text-[10px] text-[var(--gray-3)]">
              Showing <span className="font-bold text-[var(--black-2)]">{page * PER_PAGE + 1}</span> to <span className="font-bold text-[var(--black-2)]">{Math.min((page + 1) * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-[var(--black-2)]">{filtered.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={12} /></Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i ? "default" : "outline"}
                  size="icon"
                  className={`h-6 w-6 text-[10px] ${page === i ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90" : ""}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={12} /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
