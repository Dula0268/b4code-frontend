"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Layers,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  ToggleRight,
  Tag,
  Loader2,
} from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StaffMenuList() {
  const menus = useStaffMenuStore((s) => s.menus);
  const categories = useStaffMenuStore((s) => s.categories);
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);
  const fetchCategories = useStaffMenuStore((s) => s.fetchCategories);
  const toggleVisibility = useStaffMenuStore((s) => s.toggleVisibility);
  const deleteMenu = useStaffMenuStore((s) => s.deleteMenu);
  const addCategory = useStaffMenuStore((s) => s.addCategory);
  const deleteCategory = useStaffMenuStore((s) => s.deleteCategory);
  const successMsg = useStaffMenuStore((s) => s.successMsg);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);
  const isLoading = useStaffMenuStore((s) => s.isLoading);
  const categoriesLoading = useStaffMenuStore((s) => s.categoriesLoading);

  const [page, setPage] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const perPage = 4;
  const total = menus.length;
  const paged = menus.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(total / perPage);

  const activeItems = menus.reduce((n, m) => n + (m.status === "active" ? m.itemCount : 0), 0);

  const { user } = useAuthStore();

  useEffect(() => {
    const propertyId = user?.propertyId || Number(localStorage.getItem("selected_property_id"));
    if (propertyId) {
      fetchMenus(propertyId);
      fetchCategories(propertyId);
    } else {
      fetchMenus(1);
      fetchCategories(1);
    }
  }, [user, fetchMenus, fetchCategories]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

  const handleDeleteMenu = async (menuId: string, menuName: string) => {
    if (typeof window !== "undefined" && window.confirm(`Are you sure you want to delete the menu "${menuName}"? All items inside will be deleted.`)) {
      await deleteMenu(menuId);
      if (!useStaffMenuStore.getState().errorMsg) {
        setSuccess(`Menu "${menuName}" deleted successfully.`);
      }
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setAddingCategory(true);
    const propertyId = user?.propertyId || Number(localStorage.getItem("selected_property_id")) || 1;
    const result = await addCategory(name, propertyId);
    setAddingCategory(false);
    if (result) {
      setNewCategoryName("");
      setSuccess(`Category "${name}" created.`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (typeof window !== "undefined" && window.confirm(`Delete category "${name}"? Existing items linked to this category will lose their category reference.`)) {
      await deleteCategory(id);
      setSuccess(`Category "${name}" deleted.`);
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
              <h1 className="text-lg font-bold text-[var(--black-2)] leading-tight">Menu Management</h1>
              <p className="text-xs text-[var(--gray-3)] mt-0.5">Manage menus, categories, and dining options for your guests.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="text-xs h-7 gap-1.5">
                <Link href="/staff/menu/availability">
                  <ToggleRight size={13} /> Item Availability
                </Link>
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
              { label: "Total Menus", value: String(total), sub: `${menus.filter(m => m.status === "active").length} active`, icon: UtensilsCrossed, iconBg: "bg-[rgba(149,48,2,0.08)]", iconColor: "text-[var(--brand-primary)]" },
              { label: "Active Items", value: String(activeItems), sub: "Across all menus", icon: Layers, iconBg: "bg-[rgba(39,174,96,0.08)]", iconColor: "text-[var(--state-success)]" },
              { label: "Categories", value: String(categories.length), sub: "Custom defined", icon: Tag, iconBg: "bg-[rgba(99,102,241,0.08)]", iconColor: "text-indigo-500" },
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

          {/* ── Categories Manager ── */}
          <Card className="flex-none bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-[var(--black-2)] flex items-center gap-1.5">
                    <Tag size={12} className="text-indigo-500" />
                    Manage Item Categories
                  </h3>
                  <p className="text-[10px] text-[var(--gray-3)] mt-0.5">Create categories used to organise items within menus (e.g. Main, Dessert, Drinks).</p>
                </div>
              </div>

              {/* Add category input */}
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
                  placeholder="New category name (e.g. Starters)"
                  className="flex-1 text-xs h-8 rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)]"
                />
                <Button
                  size="sm"
                  className="bg-[var(--brand-primary)] text-white text-xs h-8 px-3 gap-1 hover:bg-[var(--brand-primary)]/90"
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                >
                  {addingCategory ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Add
                </Button>
              </div>

              {/* Categories list */}
              {categoriesLoading ? (
                <p className="text-[10px] text-[var(--gray-3)]">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-[10px] text-[var(--gray-4)] text-center py-3 border border-dashed border-[var(--gray-5)] rounded-[8px]">
                  No categories yet. Add one above to get started.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)] rounded-full px-2.5 py-1"
                    >
                      <span className="text-[11px] font-medium text-indigo-700">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-indigo-400 hover:text-red-500 transition-colors ml-0.5"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Menus Table ── */}
          <div className="flex-1 bg-white border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden min-h-0">
            {/* Header row */}
            <div className="flex-none grid grid-cols-[1fr_140px_130px_70px_80px_70px] gap-2 px-4 py-2 border-b border-[var(--gray-5)] bg-[rgba(0,0,0,0.015)]">
              {["MENU NAME", "ITEMS", "PRICE RANGE", "STATUS", "VISIBILITY", "ACTIONS"].map((h) => (
                <span key={h} className="text-[9px] font-bold text-[var(--gray-3)] uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {paged.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <UtensilsCrossed size={28} className="text-[var(--gray-5)] mb-3" />
                  <p className="text-sm font-medium text-[var(--black-2)]">No menus yet</p>
                  <p className="text-xs text-[var(--gray-3)] mt-1">Create your first menu to get started.</p>
                </div>
              ) : (
                paged.map((menu) => (
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
                    {/* Items */}
                    <div>
                      <p className="text-[10px] text-[var(--gray-3)]">{menu.itemCount} items</p>
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
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex-none flex items-center justify-between px-4 py-2 border-t border-[var(--gray-5)] bg-[rgba(0,0,0,0.015)]">
              <span className="text-[10px] text-[var(--gray-3)]">
                {total === 0 ? "No menus" : `Showing ${page * perPage + 1}-${Math.min((page + 1) * perPage, total)} of ${total} menus`}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="text-[10px] h-6 px-2.5">Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="text-[10px] h-6 px-2.5">Next</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
