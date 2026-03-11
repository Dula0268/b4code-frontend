"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UtensilsCrossed, Save, Plus, Trash2, ImagePlus } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import type { MenuItem } from "@/store/staff/menu/staff-menu.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type DraftItem = Omit<MenuItem, "id">;
let draftUid = 9000;

export default function StaffMenuForm({ menuId }: { menuId?: string }) {
  const router = useRouter();
  const existingMenu = useStaffMenuStore((s) => (menuId ? s.getMenu(menuId) : undefined));
  const addMenu = useStaffMenuStore((s) => s.addMenu);
  const updateMenu = useStaffMenuStore((s) => s.updateMenu);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);

  const [name, setName] = useState(existingMenu?.name ?? "");
  const [description, setDescription] = useState(existingMenu?.description ?? "");
  const [type, setType] = useState(existingMenu?.type ?? "Sri Lankan");
  const [isActive, setIsActive] = useState(existingMenu?.isVisible ?? true);
  const [nameError, setNameError] = useState(false);

  // Inline items list for new menu creation
  const [items, setItems] = useState<(DraftItem & { _uid: number })[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  // Add-item dialog state
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("Main");
  const [itemDesc, setItemDesc] = useState("");
  const [itemNameErr, setItemNameErr] = useState(false);
  const [itemPriceErr, setItemPriceErr] = useState(false);

  const isEdit = !!menuId;

  const resetItemForm = () => {
    setItemName(""); setItemPrice(""); setItemCategory("Main"); setItemDesc("");
    setItemNameErr(false); setItemPriceErr(false);
  };

  const handleAddItem = () => {
    let hasErr = false;
    if (!itemName.trim()) { setItemNameErr(true); hasErr = true; }
    if (!itemPrice.trim() || isNaN(Number(itemPrice))) { setItemPriceErr(true); hasErr = true; }
    if (hasErr) return;
    setItems((prev) => [...prev, {
      _uid: draftUid++,
      name: itemName.trim(),
      price: Number(itemPrice),
      description: itemDesc.trim(),
      category: itemCategory,
      status: "active",
      availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
      variants: [],
      modifiers: [],
    }]);
    resetItemForm();
    setShowAddItem(false);
  };

  const removeItem = (uid: number) => setItems((prev) => prev.filter((i) => i._uid !== uid));

  const handleSave = () => {
    if (!name.trim()) { setNameError(true); return; }
    if (isEdit && menuId) {
      updateMenu(menuId, { name, description, type, isVisible: isActive, status: isActive ? "active" : "draft" });
      setSuccess(`Menu "${name}" updated successfully.`);
      router.push("/staff/menu");
    } else {
      // Strip _uid before sending to store
      const cleanItems: Omit<MenuItem, "id">[] = items.map(({ _uid, ...rest }) => rest);
      const id = addMenu({ name, description, type, isVisible: isActive, status: isActive ? "active" : "draft", isNew: true }, cleanItems);
      setSuccess(`Menu "${name}" created with ${cleanItems.length} item${cleanItems.length !== 1 ? "s" : ""}.`);
      router.push(`/staff/menu/${id}`);
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
          <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={handleSave}>
            <Save size={12} /> Save Menu
          </Button>
        </div>
      </div>

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
            {/* Type */}
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Menu Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full mt-1 text-xs rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sri Lankan", "Western", "Buffet", "Snacks", "Drinks", "Desserts"].map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Description */}
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Description <span className="text-[var(--gray-3)] normal-case font-normal">(Optional)</span></Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the menu items, serving times, or dietary notes..."
                rows={3}
                className="mt-1 text-xs rounded-[8px] border-[var(--gray-5)] resize-none focus:border-[var(--brand-primary)]"
              />
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

        {/* Right: Items Panel */}
        <div className="w-[320px] shrink-0 flex flex-col gap-3 overflow-hidden">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[var(--black-2)]">Menu Items</h3>
                  <p className="text-[10px] text-[var(--gray-3)]">{items.length} item{items.length !== 1 ? "s" : ""} added</p>
                </div>
                {!isEdit && (
                  <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={() => { resetItemForm(); setShowAddItem(true); }}>
                    <Plus size={12} /> Add Item
                  </Button>
                )}
              </div>

              {items.length === 0 && !isEdit ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--gray-5)] rounded-[8px] p-4 gap-2">
                  <div className="w-10 h-10 rounded-full bg-[rgba(149,48,2,0.08)] flex items-center justify-center">
                    <UtensilsCrossed size={18} className="text-[var(--brand-primary)]" />
                  </div>
                  <p className="text-xs font-bold text-[var(--black-2)] text-center">No items added yet</p>
                  <p className="text-[10px] text-[var(--gray-3)] text-center leading-relaxed">Add dishes and beverages to this menu before saving.</p>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1 mt-1" onClick={() => { resetItemForm(); setShowAddItem(true); }}>
                    <Plus size={12} /> Add First Item
                  </Button>
                </div>
              ) : isEdit ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--gray-5)] rounded-[8px] p-4 gap-2">
                  <div className="w-10 h-10 rounded-full bg-[rgba(149,48,2,0.08)] flex items-center justify-center">
                    <UtensilsCrossed size={18} className="text-[var(--brand-primary)]" />
                  </div>
                  <p className="text-[10px] text-[var(--gray-3)] text-center leading-relaxed">To manage items, go to the menu detail view after saving.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                  {items.map((item) => (
                    <div key={item._uid} className="flex items-center gap-2.5 bg-[rgba(0,0,0,0.015)] rounded-[8px] px-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0">
                        <UtensilsCrossed size={12} className="text-[var(--brand-primary)] opacity-60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--black-2)] truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[8px] border-0 bg-[rgba(149,48,2,0.06)] text-[var(--brand-primary)] px-1.5 py-0">{item.category}</Badge>
                          <span className="text-[10px] font-medium text-[var(--brand-primary)]">LKR {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--gray-4)] hover:text-[var(--state-error)]" onClick={() => removeItem(item._uid)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-[var(--black-2)]">Add Menu Item</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Item Name <span className="text-[var(--state-error)]">*</span></Label>
              <Input
                value={itemName}
                onChange={(e) => { setItemName(e.target.value); setItemNameErr(false); }}
                placeholder="e.g. Margherita Pizza"
                className={`mt-1 text-xs rounded-[8px] ${itemNameErr ? "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]" : "border-[var(--gray-5)]"}`}
              />
              {itemNameErr && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Item name is required.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Price (LKR) <span className="text-[var(--state-error)]">*</span></Label>
                <Input
                  value={itemPrice}
                  onChange={(e) => { setItemPrice(e.target.value); setItemPriceErr(false); }}
                  placeholder="e.g. 3000"
                  className={`mt-1 text-xs rounded-[8px] ${itemPriceErr ? "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]" : "border-[var(--gray-5)]"}`}
                />
                {itemPriceErr && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Valid price required.</p>}
              </div>
              <div>
                <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Category</Label>
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger className="w-full mt-1 text-xs rounded-[8px] border-[var(--gray-5)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Main", "Starter", "Dessert", "Drink", "Side"].map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Description <span className="text-[var(--gray-3)] normal-case font-normal">(Optional)</span></Label>
              <Textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Brief description of the item..."
                rows={2}
                className="mt-1 text-xs rounded-[8px] border-[var(--gray-5)] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowAddItem(false)}>Cancel</Button>
            <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={handleAddItem}>
              <Plus size={12} /> Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
