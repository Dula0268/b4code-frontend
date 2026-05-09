"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UtensilsCrossed, Save, Plus, Trash2, ImagePlus, X, Upload, Loader2 } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import api from "@/lib/axios";
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

  const isLoading = useStaffMenuStore((s) => s.isLoading);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);

  const [name, setName] = useState(existingMenu?.name ?? "");
  const [description, setDescription] = useState(existingMenu?.description ?? "");
  const [type, setType] = useState(existingMenu?.type ?? "Sri Lankan");
  const [isActive, setIsActive] = useState(existingMenu?.isVisible ?? true);
  const [nameError, setNameError] = useState(false);
  const [descError, setDescError] = useState(false);

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
  const [itemImageFiles, setItemImageFiles] = useState<File[]>([]);
  const [itemImagePreviews, setItemImagePreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { user } = useAuthStore();
  const propertyId = user?.propertyId;

  const isEdit = !!menuId;

  const resetItemForm = () => {
    setItemName(""); setItemPrice(""); setItemCategory("Main"); setItemDesc("");
    setItemNameErr(false); setItemPriceErr(false);
    setItemImageFiles([]); setItemImagePreviews([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setItemImageFiles((prev) => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setItemImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedImage = (index: number) => {
    setItemImageFiles((prev) => prev.filter((_, i) => i !== index));
    setItemImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = async () => {
    let hasErr = false;
    if (!itemName.trim()) { setItemNameErr(true); hasErr = true; }
    if (!itemPrice.trim() || isNaN(Number(itemPrice)) || Number(itemPrice) < 0) { setItemPriceErr(true); hasErr = true; }
    if (hasErr) return;

    const uploadedUrls: string[] = [];
    if (itemImageFiles.length > 0) {
      setUploadingImage(true);
      try {
        for (const file of itemImageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "menu_items");
          const res = await api.post("/images/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadedUrls.push(res.data.url);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploadingImage(false);
      }
    }

    setItems((prev) => [...prev, {
      _uid: draftUid++,
      name: itemName.trim(),
      price: Number(itemPrice),
      description: itemDesc.trim(),
      category: itemCategory,
      status: "active",
      imageUrls: uploadedUrls,
      availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
      variants: [],
      modifiers: [],
    }]);
    resetItemForm();
    setShowAddItem(false);
  };

  const removeItem = (uid: number) => setItems((prev) => prev.filter((i) => i._uid !== uid));

  const handleSave = async () => {
    let hasErr = false;
    if (!name.trim()) { setNameError(true); hasErr = true; }
    if (!description.trim() && !isEdit) { setDescError(true); hasErr = true; }
    if (!isEdit && items.length === 0) {
      setError("Please add at least one item to create a menu.");
      return;
    }
    if (hasErr) return;
    if (isEdit && menuId) {
      updateMenu(menuId, { name, description, type, isVisible: isActive, status: isActive ? "active" : "draft" });
      setSuccess(`Menu "${name}" updated successfully.`);
      router.push("/staff/menu");
    } else {
      const cleanItems: Omit<MenuItem, "id">[] = items.map(({ _uid, ...rest }) => rest);
      const id = await addMenu({ name, description, type, isVisible: isActive, status: isActive ? "active" : "draft", isNew: true }, cleanItems, propertyId);
      if (id) {
        setSuccess(`Menu "${name}" created with ${cleanItems.length} item${cleanItems.length !== 1 ? "s" : ""}.`);
        router.push("/staff/menu");
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
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img src={item.imageUrls[0]} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={12} className="text-[var(--brand-primary)] opacity-60" />
                        </div>
                      )}
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
        <DialogContent className="max-w-[450px] bg-white border border-[var(--gray-5)] shadow-xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[var(--gray-5)] bg-[rgba(0,0,0,0.01)]">
            <DialogTitle className="text-base font-bold text-[var(--black-2)]">Add Menu Item</DialogTitle>
            <p className="text-[10px] text-[var(--gray-3)] mt-0.5">Enter details for the new dish or beverage.</p>
          </DialogHeader>
          <div className="flex flex-col gap-5 px-6 py-5">
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase tracking-wider">Item Name <span className="text-[var(--state-error)]">*</span></Label>
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
            {/* Image Upload */}
            <div>
              <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Dish Photos <span className="text-[var(--gray-3)] normal-case font-normal">(Optional)</span></Label>
              
              <div className="mt-2 grid grid-cols-4 gap-2">
                {itemImagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[8px] overflow-hidden border border-[var(--gray-5)]">
                    <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSelectedImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0 p-0"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                
                {itemImagePreviews.length < 8 && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[var(--gray-5)] rounded-[8px] cursor-pointer hover:border-[var(--brand-primary)] hover:bg-[rgba(149,48,2,0.02)] transition-colors">
                    <Upload size={14} className="text-[var(--gray-4)]" />
                    <span className="text-[8px] text-[var(--gray-4)] mt-1">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </div>
              <p className="text-[9px] text-[var(--gray-4)] mt-2">Upload up to 8 images (JPG, PNG)</p>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-[var(--gray-5)] bg-[rgba(0,0,0,0.01)]">
            <Button variant="outline" size="sm" className="text-xs h-8 px-4" onClick={() => setShowAddItem(false)} disabled={uploadingImage}>Cancel</Button>
            <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-8 px-4 gap-1.5 hover:bg-[var(--brand-primary)]/90" onClick={handleAddItem} disabled={uploadingImage}>
              {uploadingImage ? <><Loader2 size={12} className="animate-spin" /> Processing...</> : <><Plus size={12} /> Add Item</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
