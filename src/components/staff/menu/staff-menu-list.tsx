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
  Settings,
} from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import StaffHeader from "@/components/staff/layout/staff-header";

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
  const serviceChargeRate = useStaffMenuStore((s) => s.serviceChargeRate);
  const fetchServiceCharge = useStaffMenuStore((s) => s.fetchServiceCharge);
  const updateServiceCharge = useStaffMenuStore((s) => s.updateServiceCharge);
  const [editingCharge, setEditingCharge] = useState(false);
  const [chargeInput, setChargeInput] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingMenu, setDeletingMenu] = useState(false);
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
      fetchServiceCharge(propertyId);
    } else {
      fetchMenus(1);
      fetchCategories(1);
      fetchServiceCharge(1);
    }
  }, [user, fetchMenus, fetchCategories, fetchServiceCharge]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg, setSuccess]);

  const handleDeleteMenu = (menuId: string, menuName: string) => {
    setMenuToDelete({ id: menuId, name: menuName });
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    setDeletingMenu(true);
    await deleteMenu(menuToDelete.id);
    if (!useStaffMenuStore.getState().errorMsg) {
      setSuccess(`Menu "${menuToDelete.name}" deleted successfully.`);
    }
    setDeletingMenu(false);
    setMenuToDelete(null);
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

  const handleDeleteCategory = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setSuccess(`Category "${categoryToDelete.name}" deleted.`);
    setCategoryToDelete(null);
  };

  const handleUpdateCharge = async () => {
    const rate = parseFloat(chargeInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError("Please enter a valid percentage between 0 and 100.");
      return;
    }
    const propertyId = user?.propertyId || Number(localStorage.getItem("selected_property_id")) || 1;
    await updateServiceCharge(propertyId, rate);
    setEditingCharge(false);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar">
      <StaffHeader
        title="Menu Management"
        subtitle="Manage menus, categories, and dining options for your guests."
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-9 px-4 rounded-xl border-[#E8EAED] bg-white shadow-sm font-bold text-[#1A1A1A] gap-2 transition-all">
              <Link href="/staff/menu/availability">
                <ToggleRight size={16} className="text-[#C05621]" /> Item Availability
              </Link>
            </Button>
            <Button asChild size="sm" className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white hover:from-[#C05621] hover:to-[#99451A] shadow-md font-bold gap-2 transition-all">
              <Link href="/staff/menu/new">
                <Plus size={16} /> Create New Menu
              </Link>
            </Button>
          </>
        }
      />
      <div className="flex flex-col flex-1 px-4 lg:px-6 py-4 lg:py-6 gap-4 lg:gap-6 pt-[80px] lg:pt-[88px] min-h-min pb-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 lg:gap-6 h-full">
      {/* ── Loading State ── */}
      {isLoading && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-none flex items-center justify-between mb-2">
            <div className="animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2 animate-pulse">
              <div className="h-7 w-28 bg-gray-200 rounded"></div>
              <div className="h-7 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="flex-none grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white py-3 px-4 border border-[var(--gray-5)] rounded-[10px] h-20 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="w-2/3">
                    <div className="h-2 w-1/2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-1/3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 w-1/4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 bg-white border border-[var(--gray-5)] rounded-[10px] p-4 animate-pulse mt-2">
            <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="flex gap-2 mb-8">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
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

          {/* ── Error / Info Banner ── */}
          {errorMsg && (
            <div className={`flex-none flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm border ${
              errorMsg.includes("offline") || errorMsg.includes("Connection")
                ? "bg-[#FFF8F0] border-[#F0EBE7] text-[#C05621]"
                : "bg-[rgba(235,87,87,0.08)] border-[rgba(235,87,87,0.2)] text-[#eb5757]"
            }`}>
              <span className="font-medium flex-1">
                {errorMsg.includes("offline") || errorMsg.includes("Connection") 
                  ? "Viewing offline data. Changes will sync when connection is restored." 
                  : errorMsg}
              </span>
              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-transparent" onClick={() => setError(null)}>
                <X size={14} className={errorMsg.includes("offline") || errorMsg.includes("Connection") ? "text-[#C05621]" : "text-[#eb5757]"} />
              </Button>
            </div>
          )}

          {/* ── Summary Stats ── */}
          <div className="flex-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Total Menus", value: String(total), sub: `${menus.filter(m => m.status === "active").length} active`, icon: UtensilsCrossed, iconBg: "bg-[rgba(192,86,33,0.1)]", iconColor: "text-[#C05621]" },
              { label: "Active Items", value: String(activeItems), sub: "Across all menus", icon: Layers, iconBg: "bg-[rgba(45,125,92,0.1)]", iconColor: "text-[#2D7D5C]" },
              { label: "Categories", value: String(categories.length), sub: "Custom defined", icon: Tag, iconBg: "bg-[rgba(99,102,241,0.1)]", iconColor: "text-indigo-500" },
            ].map((s) => (
              <div key={s.label} className="col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white p-5 lg:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div className={`p-3 ${s.iconBg.replace('0.1', '0.15')} rounded-2xl self-start group-hover:scale-110 transition-transform`}>
                    <s.icon size={22} className={s.iconColor} />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase bg-white/50 px-2 py-1 rounded-lg border border-white shadow-sm">
                    {s.sub}
                  </span>
                </div>
                <div className="mt-8 flex flex-col gap-1">
                  <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#6B7280] uppercase">{s.label}</h3>
                  <p className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter leading-none m-0">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-none grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ── Categories Manager ── */}
            <Card className="bg-white/80 backdrop-blur-xl py-0 gap-0 border border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
            <CardContent className="p-5 lg:p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--black-2)] flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    Manage Item Categories
                  </h3>
                  <p className="text-[11px] text-[var(--gray-3)] mt-1 line-clamp-1">Create categories used to organise items within menus.</p>
                </div>
              </div>

              {/* Add category input */}
              <div className="flex items-center gap-3 mb-5">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
                  placeholder="New category name (e.g. Starters)"
                  className="flex-1 h-10 rounded-xl border-[var(--gray-5)] focus:border-[var(--brand-primary)] px-4"
                />
                <Button
                  className="bg-[var(--brand-primary)] text-white h-10 px-5 gap-2 rounded-xl font-bold hover:bg-[var(--brand-primary)]/90 shadow-sm"
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                >
                  {addingCategory ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add
                </Button>
              </div>

              {/* Categories list */}
              {categoriesLoading ? (
                <div className="flex flex-col gap-2 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-full bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-[var(--gray-4)] text-center py-6 border border-dashed border-[var(--gray-5)] rounded-2xl">
                  No categories yet. Add one above to get started.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2.5 overflow-y-auto max-h-[120px] custom-scrollbar pr-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1.5 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)] rounded-xl px-3 py-1.5"
                    >
                      <span className="text-[12px] font-bold text-indigo-700">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-indigo-400 hover:text-red-500 transition-colors ml-1"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

            {/* ── Order Settings ── */}
            <Card className="bg-white/80 backdrop-blur-xl py-0 gap-0 border border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
              <CardContent className="p-5 lg:p-6 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--black-2)] flex items-center gap-2">
                      <Settings size={16} className="text-[var(--brand-primary)]" />
                      Global Order Settings
                    </h3>
                    <p className="text-[11px] text-[var(--gray-3)] mt-1">Configure property-wide settings like service charges.</p>
                  </div>
                </div>

                <div className="bg-[rgba(192,86,33,0.03)] border border-[rgba(192,86,33,0.1)] rounded-2xl p-5 flex flex-col gap-3 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold tracking-wide text-[var(--black-2)] uppercase">Service Charge</span>
                    {editingCharge ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={chargeInput}
                          onChange={(e) => setChargeInput(e.target.value)}
                          className="w-20 h-9 rounded-xl font-bold px-3 text-center"
                          placeholder="%"
                        />
                        <Button onClick={handleUpdateCharge} className="h-9 px-4 rounded-xl font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90">Save</Button>
                        <Button variant="ghost" onClick={() => setEditingCharge(false)} className="h-9 px-3 rounded-xl font-semibold">Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold text-[var(--brand-primary)]">{serviceChargeRate}%</span>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl border border-[#F0EBE7] shadow-sm bg-white hover:bg-[#FFF8F0]" onClick={() => { setChargeInput(String(serviceChargeRate)); setEditingCharge(true); }}>
                          <Pencil size={14} className="text-[#C05621]" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-[var(--gray-3)]">Applied automatically to all guest orders placed via the platform.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Menus Table ── */}
          <div className="flex-none bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto custom-scrollbar flex flex-col">
              <div className="min-w-[700px] flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex-none grid grid-cols-[1fr_120px_110px_70px_80px_70px] gap-2 px-4 py-2 border-b border-[var(--gray-5)] bg-white/50">
                  {["MENU NAME", "ITEMS", "PRICE RANGE", "STATUS", "VISIBILITY", "ACTIONS"].map((h) => (
                    <span key={h} className="text-[9px] font-bold text-[var(--gray-3)] uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                {/* Rows */}
                <div className="flex flex-col">
                  {paged.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <UtensilsCrossed size={28} className="text-[var(--gray-5)] mb-3" />
                      <p className="text-sm font-medium text-[var(--black-2)]">No menus yet</p>
                      <p className="text-xs text-[var(--gray-3)] mt-1">Create your first menu to get started.</p>
                    </div>
                  ) : (
                    paged.map((menu) => (
                      <div key={menu.id} className="grid grid-cols-[1fr_120px_110px_70px_80px_70px] gap-2 items-center px-4 py-2.5 border-b border-[var(--gray-5)] hover:bg-[rgba(0,0,0,0.01)] transition-colors">
                        {/* Name */}
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-9 h-9 rounded-lg bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0">
                            <UtensilsCrossed size={15} className="text-[var(--brand-primary)] opacity-50" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[var(--black-2)] truncate">{menu.name}</p>
                              {menu.isNew && (
                                <span className="text-[8px] font-bold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)] px-1.5 py-px rounded shrink-0">NEW</span>
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
                        <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0.5 border-0 justify-center ${
                          menu.status === "active"
                            ? "bg-[rgba(39,174,96,0.1)] text-[var(--state-success)]"
                            : "bg-[rgba(130,130,130,0.1)] text-[var(--gray-3)]"
                        }`}>
                          {menu.status === "active" ? "Active" : "Draft"}
                        </Badge>
                        {/* Visibility */}
                        <div className="flex justify-center">
                          <Switch
                            checked={menu.isVisible}
                            onCheckedChange={() => toggleVisibility(menu.id)}
                            className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                          />
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1">
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
              </div>
            </div>

            {/* Pagination */}
            <div className="flex-none flex items-center justify-between px-4 py-2 border-t border-[var(--gray-5)] bg-white/50">
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
      
      <DeleteConfirmationDialog
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? Existing items linked to this category will lose their category reference.`}
      />

      <DeleteConfirmationDialog
        isOpen={menuToDelete !== null}
        onClose={() => setMenuToDelete(null)}
        onConfirm={confirmDeleteMenu}
        title="Delete Menu"
        description={`Are you sure you want to delete the menu "${menuToDelete?.name}"? All items inside will be deleted.`}
        loading={deletingMenu}
      />
        </div>
      </div>
    </div>
  );
}
