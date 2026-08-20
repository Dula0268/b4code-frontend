"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Pencil, Trash2, LayoutGrid, List, UtensilsCrossed, Flame, CheckCircle, X, Loader2 } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import type { MenuItem } from "@/store/staff/menu/staff-menu.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function StaffMenuEdit({ menuId }: { menuId: string }) {
  const router = useRouter();
  const menu = useStaffMenuStore((s) => s.getMenu(menuId));
  const deleteItem = useStaffMenuStore((s) => s.deleteItem);
  const toggleItemStatus = useStaffMenuStore((s) => s.toggleItemStatus);
  const successMsg = useStaffMenuStore((s) => s.successMsg);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);
  const isLoading = useStaffMenuStore((s) => s.isLoading);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  const categories = useMemo(() => {
    if (!menu) return [];
    const cats = new Set(menu.items.map((i) => i.categoryName));
    return ["All Categories", ...Array.from(cats)];
  }, [menu]);

  const filteredItems = useMemo(() => {
    if (!menu) return [];
    return menu.items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || item.categoryName === category;
      return matchSearch && matchCat;
    });
  }, [menu, search, category]);

  const handleDeleteItem = (itemId: string, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeletingItemId(itemToDelete.id);
    try {
      await deleteItem(menuId, itemToDelete.id);
      setSuccess(`Item "${itemToDelete.name}" removed.`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (_err) {
      // Error handled by store
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleToggleStatus = async (itemId: string, _itemName: string) => {
    setTogglingItemId(itemId);
    try {
      await toggleItemStatus(menuId, itemId);
      // No success message for simple toggle to avoid clutter
    } catch (_err) {
      // Error handled by store
    } finally {
      setTogglingItemId(null);
    }
  };

  const { user } = useAuthStore();
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);

  // Auto-fetch if missing (e.g. on refresh)
  useEffect(() => {
    if (!menu && user?.propertyId) {
      fetchMenus(user.propertyId);
    }
  }, [menu, user, fetchMenus]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

    if (isLoading && !menu) {
      return (
        <div className="h-full flex flex-col p-5 gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex-1 rounded-xl border border-[var(--gray-5)] bg-white p-6 shadow-sm flex flex-col gap-4">
            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-100 rounded animate-pulse mt-4" />
          </div>
        </div>
      );
    }

  if (!menu) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(130,130,130,0.05)] flex items-center justify-center">
          <UtensilsCrossed size={32} className="text-[var(--gray-3)] opacity-20" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--black-1)]">Menu Not Found</h3>
          <p className="text-sm text-[var(--gray-3)] mt-1 max-w-[260px]">
            We couldn&apos;t find the category &quot;{menuId}&quot;. It might have been deleted or renamed.
          </p>
        </div>
        <Button onClick={() => router.push("/staff/menu")} variant="outline" className="mt-2 rounded-[10px]">
          Back to Overview
        </Button>
      </div>
    );
  }

  const statusBadge = (item: MenuItem) => {
    const isActive = item.status === "active";
    const label = item.tag || (isActive ? "Active" : "Draft");
    return (
      <Badge variant="outline" className={`text-[9px] font-bold uppercase border-0 ${isActive ? "bg-[rgba(39,174,96,0.08)] text-[var(--state-success)]" : "bg-[rgba(130,130,130,0.08)] text-[var(--gray-3)]"
        }`}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      <DeleteConfirmationDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setItemToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        description={`Are you sure you want to remove "${itemToDelete?.name}" from this menu? This action cannot be undone.`}
        loading={deletingItemId !== null}
      />

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

      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push("/staff/menu")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--black-2)] leading-tight">{menu.name}</h1>
            <p className="text-[10px] text-[var(--gray-3)]">{menu.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/staff/menu/${menuId}?edit=true`}>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
              <Pencil size={12} /> Edit Details
            </Button>
          </Link>
          <Link href={`/staff/menu/${menuId}/items/new`}>
            <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1">
              <Plus size={12} /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu summary card */}
      <Card className="bg-white flex-none py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <CardContent className="px-4 py-2.5 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(149,48,2,0.08)] flex items-center justify-center">
              <UtensilsCrossed size={14} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--black-2)]">{menu.name}</p>
              <p className="text-[10px] text-[var(--gray-3)]">Dining Menu</p>
            </div>
          </div>
          <div className="h-6 w-px bg-[var(--gray-5)]" />
          <div>
            <p className="text-[10px] text-[var(--gray-3)]">Items</p>
            <p className="text-xs font-bold text-[var(--black-2)]">{menu.items.length}</p>
          </div>
          <div className="h-6 w-px bg-[var(--gray-5)]" />
          <div>
            <p className="text-[10px] text-[var(--gray-3)]">Price Range</p>
            <p className="text-xs font-bold text-[var(--black-2)]">{menu.priceRange}</p>
          </div>
          <div className="h-6 w-px bg-[var(--gray-5)]" />
          <div>
            <p className="text-[10px] text-[var(--gray-3)]">Status</p>
            <Badge variant="outline" className={`text-[10px] font-bold border-0 ${menu.status === "active" ? "bg-[rgba(39,174,96,0.1)] text-[var(--state-success)]" : "bg-[rgba(130,130,130,0.1)] text-[var(--gray-3)]"}`}>
              {menu.status === "active" ? "Active" : "Draft"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex-none flex items-center gap-2">
        <div className="relative flex-1 max-w-[240px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-4)] z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)]"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="text-xs rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)] w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex border border-[var(--gray-5)] rounded-[8px] overflow-hidden">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className={`h-7 w-7 rounded-none ${viewMode === "grid" ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90" : "text-[var(--gray-3)]"}`}>
            <LayoutGrid size={13} />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")} className={`h-7 w-7 rounded-none ${viewMode === "list" ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90" : "text-[var(--gray-3)]"}`}>
            <List size={13} />
          </Button>
        </div>
      </div>

      {/* Items Grid / List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[rgba(149,48,2,0.08)] flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-[var(--brand-primary)]" />
            </div>
            <p className="text-xs font-bold text-[var(--black-2)]">No items yet</p>
            <p className="text-[10px] text-[var(--gray-3)]">Add your first menu item to get started.</p>
            <Link href={`/staff/menu/${menuId}/items/new`}>
              <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1 mt-1">
                <Plus size={12} /> Add First Item
              </Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border border-[var(--gray-5)] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col">
                {/* Image display */}
                <div className="h-24 bg-gradient-to-br from-[var(--gray-5)] to-[rgba(149,48,2,0.05)] relative flex items-center justify-center overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <UtensilsCrossed size={20} className="text-[var(--gray-4)]" />
                  )}
                  <div className="absolute top-2 left-2">{statusBadge(item)}</div>
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <p className="text-xs font-bold text-[var(--black-2)] leading-tight">{item.name}</p>
                  <p className="text-[10px] text-[var(--gray-3)] line-clamp-2">{item.description}</p>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--brand-primary)]">LKR {item.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--gray-3)]">
                      {item.calories && (
                        <span className="flex items-center gap-0.5"><Flame size={10} />{item.calories} Cal</span>
                      )}
                      {item.tag && <span>• {item.tag}</span>}
                    </div>
                  </div>
                  {/* Availability toggle */}
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--gray-5)]">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.status === "active"}
                        onCheckedChange={() => handleToggleStatus(item.id, item.name)}
                        disabled={togglingItemId === item.id}
                        className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                      />
                      {togglingItemId === item.id && <Loader2 size={10} className="animate-spin text-[var(--gray-3)]" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Link href={`/staff/menu/${menuId}/items/${item.id}`} className="flex-1 text-center py-1 text-[10px] font-bold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.06)] rounded-md hover:bg-[rgba(149,48,2,0.12)] transition-colors">
                      EDIT
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      disabled={deletingItemId === item.id}
                      className="p-1 text-[var(--gray-4)] hover:text-[var(--state-error)] transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border border-[var(--gray-5)] rounded-[10px] px-3 py-2.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--gray-5)] to-[rgba(149,48,2,0.05)] flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <UtensilsCrossed size={14} className="text-[var(--gray-4)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--black-2)]">{item.name}</p>
                  <p className="text-[10px] text-[var(--gray-3)] truncate">{item.description}</p>
                </div>
                {statusBadge(item)}
                <span className="text-xs font-bold text-[var(--brand-primary)] shrink-0">LKR {item.price.toLocaleString()}</span>
                {item.calories && <span className="text-[10px] text-[var(--gray-3)] flex items-center gap-0.5 shrink-0"><Flame size={10} />{item.calories}</span>}
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={item.status === "active"}
                    onCheckedChange={() => handleToggleStatus(item.id, item.name)}
                    disabled={togglingItemId === item.id}
                    className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                  />
                  {togglingItemId === item.id && <Loader2 size={10} className="animate-spin text-[var(--gray-3)]" />}
                </div>
                <Link href={`/staff/menu/${menuId}/items/${item.id}`} className="text-[10px] font-bold text-[var(--brand-primary)] hover:underline shrink-0">EDIT</Link>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  disabled={deletingItemId === item.id}
                  className="p-1 text-[var(--gray-4)] hover:text-[var(--state-error)] transition-colors shrink-0 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
