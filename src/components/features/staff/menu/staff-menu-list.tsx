"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Layers,
  TrendingUp,
  Plus,
  SlidersHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  ToggleRight,
} from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffMenuList() {
  const menus = useStaffMenuStore((s) => s.menus);
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);
  const toggleVisibility = useStaffMenuStore((s) => s.toggleVisibility);
  const deleteMenu = useStaffMenuStore((s) => s.deleteMenu);
  const successMsg = useStaffMenuStore((s) => s.successMsg);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);
  const isLoading = useStaffMenuStore((s) => s.isLoading);

  const [page, setPage] = useState(0);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const perPage = 4;
  const total = menus.length;
  const paged = menus.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(total / perPage);

  const activeItems = menus.reduce((n, m) => n + (m.status === "active" ? m.itemCount : 0), 0);

  // Fetch menus on mount (assuming property ID is 1 for now - adjust as needed)
  useEffect(() => {
    const propertyId = 1; // TODO: Get from user context or URL
    fetchMenus(propertyId);
  }, [fetchMenus]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

  const handleDeleteMenu = async (menuId: string, menuName: string) => {
    if (typeof window !== "undefined" && window.confirm(`Are you sure you want to delete the menu "${menuName}"? This action cannot be undone.`)) {
      await deleteMenu(menuId);
      if (!useStaffMenuStore.getState().errorMsg) {
        setSuccess(`Menu "${menuName}" deleted successfully.`);
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* ── Loading State ── */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--gray-5)] border-t-[var(--brand-primary)]"></div>
            <p className="text-sm text-[var(--gray-3)] mt-3">Loading menus...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
      {/* ── Success Banner ── */}
      {successMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(39,174,96,0.08)] border border-[rgba(39,174,96,0.2)] rounded-[10px] px-4 py-2 text-sm">
          <CheckCircle size={16} className="text-[var(--state-success)]" />
          <span className="text-[var(--black-2)] font-medium flex-1">{successMsg}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSuccess(null)}><X size={14} /></Button>
        </div>
      )}

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(235,87,87,0.08)] border border-[rgba(235,87,87,0.2)] rounded-[10px] px-4 py-2 text-sm">
          <span className="text-[#eb5757] font-medium flex-1">{errorMsg}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setError(null)}><X size={14} /></Button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex-none flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--black-2)] leading-tight">Menus List</h1>
          <p className="text-xs text-[var(--gray-3)] mt-0.5">Manage dining options available for your guests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs h-7 gap-1.5">
            <Link href="/staff/menu/availability">
              <ToggleRight size={13} /> Item Availability
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5">
            <SlidersHorizontal size={13} /> Filter
          </Button>
          <Button asChild size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1.5 hover:bg-[var(--brand-primary)]/90">
            <Link href="/staff/menu/new">
              <Plus size={13} /> Create New Menu
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex-none grid grid-cols-3 gap-3">
        {[
          { label: "Total Menus", value: String(total), sub: "2 added this month", icon: UtensilsCrossed, iconBg: "bg-[rgba(149,48,2,0.08)]", iconColor: "text-[var(--brand-primary)]" },
          { label: "Active Items", value: String(activeItems), sub: "Across all menus", icon: Layers, iconBg: "bg-[rgba(39,174,96,0.08)]", iconColor: "text-[var(--state-success)]" },
          { label: "Most Popular", value: "Seafood Dinner", sub: "45 orders last week", icon: TrendingUp, iconBg: "bg-[rgba(149,48,2,0.08)]", iconColor: "text-[var(--brand-primary)]" },
        ].map((s) => (
          <Card key={s.label} className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="px-4 py-3 flex items-start justify-between">
              <div>
                <p className="text-[10px] text-[var(--gray-3)] font-medium">{s.label}</p>
                <p className="text-xl font-bold text-[var(--black-2)] leading-tight mt-0.5">{s.value}</p>
                <p className="text-[10px] text-[var(--gray-3)] mt-0.5">{s.sub}</p>
              </div>
              <div className={`${s.iconBg} rounded-lg p-2`}>
                <s.icon size={16} className={s.iconColor} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 bg-white border border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden min-h-0">
        {/* Header row */}
        <div className="flex-none grid grid-cols-[1fr_140px_130px_70px_80px_70px] gap-2 px-4 py-2 border-b border-[var(--gray-5)] bg-[rgba(0,0,0,0.015)]">
          {["MENU NAME", "TYPE & ITEMS", "PRICE RANGE", "STATUS", "VISIBILITY", "ACTIONS"].map((h) => (
            <span key={h} className="text-[9px] font-bold text-[var(--gray-3)] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {paged.map((menu) => (
            <div key={menu.id} className="grid grid-cols-[1fr_140px_130px_70px_80px_70px] gap-2 items-center px-4 py-2.5 border-b border-[var(--gray-5)] hover:bg-[rgba(0,0,0,0.01)] transition-colors">
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={15} className="text-[var(--brand-primary)] opacity-50" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[var(--black-2)] truncate">{menu.name}</p>
                    {menu.isNew && (
                      <span className="text-[8px] font-bold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)] px-1.5 py-px rounded">NEW</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--gray-3)] truncate">{menu.description}</p>
                </div>
              </div>
              {/* Type & Items */}
              <div>
                <p className="text-xs text-[var(--black-2)]">{menu.type}</p>
                <p className="text-[10px] text-[var(--gray-3)]">{menu.itemCount} items included</p>
              </div>
              {/* Price Range */}
              <p className="text-xs font-medium text-[var(--black-2)]">{menu.priceRange}</p>
              {/* Status */}
              <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0.5 border-0 ${
                menu.status === "active"
                  ? "bg-[rgba(39,174,96,0.1)] text-[var(--state-success)]"
                  : "bg-[rgba(130,130,130,0.1)] text-[var(--gray-3)]"
              }`}>
                {menu.status === "active" ? "Active" : "Draft"}
              </Badge>
              {/* Visibility */}
              <Switch
                checked={menu.isVisible}
                onCheckedChange={() => toggleVisibility(menu.id)}
                className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
              />
              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-[var(--gray-3)]">
                  <Link href={`/staff/menu/${menu.id}`}>
                    <Pencil size={13} />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-[var(--gray-3)] hover:text-[var(--state-error)]" 
                  onClick={() => handleDeleteMenu(menu.id, menu.name)}
                  disabled={deletingMenuId === menu.id}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex-none flex items-center justify-between px-4 py-2 border-t border-[var(--gray-5)] bg-[rgba(0,0,0,0.015)]">
          <span className="text-[10px] text-[var(--gray-3)]">
            Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, total)} of {total} menus
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-[10px] h-6 px-2.5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-[10px] h-6 px-2.5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
