"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UtensilsCrossed, Save, X } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffMenuForm({ menuId }: { menuId?: string }) {
  const router = useRouter();
  const existingMenu = useStaffMenuStore((s) => (menuId ? s.getMenu(menuId) : undefined));
  const addMenu = useStaffMenuStore((s) => s.addMenu);
  const updateMenu = useStaffMenuStore((s) => s.updateMenu);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);

  const isLoading = useStaffMenuStore((s) => s.isLoading);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);

  const [name, setName] = useState(existingMenu?.name ?? "");
  const [description, setDescription] = useState(existingMenu?.description ?? "");
  const [isActive, setIsActive] = useState(existingMenu?.status === "active" || !existingMenu);
  const [nameError, setNameError] = useState(false);

  const { user } = useAuthStore();
  const propertyId = user?.propertyId;

  const isEdit = !!menuId;

  const handleSave = async () => {
    if (!name.trim()) { setNameError(true); return; }
    if (isEdit && menuId) {
      await updateMenu(menuId, { name, description, status: isActive ? "active" : "draft" });
      setSuccess(`Menu "${name}" updated successfully.`);
      router.push("/staff/menu");
    } else {
      const id = await addMenu({ name, description, status: isActive ? "active" : "draft" }, propertyId);
      if (id) {
        setSuccess(`Menu "${name}" created. Now add items to it.`);
        router.push(`/staff/menu/${id}`);
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push("/staff/menu")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--black-2)] leading-tight">{isEdit ? "Edit Menu" : "Create New Menu"}</h1>
            <p className="text-[10px] text-[var(--gray-3)]">{isEdit ? "Update menu details." : "Configure the details and add items for a new dining selection."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => router.push("/staff/menu")}>Cancel</Button>
          <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={handleSave} disabled={isLoading}>
            <Save size={12} /> {isLoading ? "Saving..." : "Save Menu"}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(235,87,87,0.08)] border border-[rgba(235,87,87,0.2)] rounded-[10px] px-4 py-2 text-sm">
          <span className="text-[#eb5757] font-medium flex-1">{errorMsg}</span>
          <button onClick={() => setError(null)} className="text-[#eb5757] hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {/* Body — 2-column */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Left: Form Fields */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-3">
            {/* Name */}
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Menu Name <span className="text-[var(--state-error)]">*</span></Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
                placeholder="e.g. Summer Breakfast Buffet"
                className={`mt-1 text-xs rounded-[8px] ${
                  nameError ? "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]" : "border-[var(--gray-5)] focus:border-[var(--brand-primary)]"
                }`}
              />
              {nameError && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Menu name is required to continue.</p>}
            </div>

            {/* Description */}
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Description <span className={descError && !isEdit ? "text-[var(--state-error)]" : "text-[var(--gray-3)] normal-case font-normal"}>(Optional)</span></Label>
              <Textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setDescError(false); }}
                placeholder="Provide details about the menu items, serving times, or dietary notes..."
                rows={3}
                className={`mt-1 text-xs rounded-[8px] resize-none focus:border-[var(--brand-primary)] ${
                  descError && !isEdit ? "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]" : "border-[var(--gray-5)]"
                }`}
              />
              {descError && !isEdit && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Description is required for new menus.</p>}
              <p className="text-[10px] text-[var(--gray-4)] mt-0.5">Briefly describe what this menu offers to guests.</p>
            </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4">
            <h3 className="text-xs font-bold text-[var(--black-2)] mb-2">Visibility Settings</h3>
            <div className="flex items-center justify-between bg-[rgba(0,0,0,0.015)] rounded-[8px] px-3 py-2.5">
              <div>
                <p className="text-xs font-bold text-[var(--black-2)]">Active Status</p>
                <p className="text-[10px] text-[var(--gray-3)]">Make this menu immediately visible to staff and guests.</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[var(--brand-primary)]" />
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Info Panel */}
        <div className="w-[280px] shrink-0 flex flex-col gap-3">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-[rgba(149,48,2,0.08)] flex items-center justify-center mb-1">
                <UtensilsCrossed size={18} className="text-[var(--brand-primary)]" />
              </div>
              <p className="text-xs font-bold text-[var(--black-2)]">Items added after creation</p>
              <p className="text-[10px] text-[var(--gray-3)] leading-relaxed">
                {isEdit
                  ? "Save changes and go back to the menu list to manage items."
                  : "After creating this menu, you will be taken directly to the menu detail page to add items with full options (categories, images, variants)."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
