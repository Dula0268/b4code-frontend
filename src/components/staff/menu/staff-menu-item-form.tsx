"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Clock, GripVertical, X, Upload } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import api from "@/lib/axios";
import type { Variant, Modifier, AvailabilityWindow } from "@/store/staff/menu/staff-menu.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

let variantUid = 1000;
let modifierUid = 2000;

export default function StaffMenuItemForm({ menuId, itemId }: { menuId: string; itemId?: string }) {
  const router = useRouter();
  const menu = useStaffMenuStore((s) => s.getMenu(menuId));
  const categories = useStaffMenuStore((s) => s.categories);
  const fetchCategories = useStaffMenuStore((s) => s.fetchCategories);
  const addItem = useStaffMenuStore((s) => s.addItem);
  const updateItem = useStaffMenuStore((s) => s.updateItem);
  const setSuccess = useStaffMenuStore((s) => s.setSuccess);
  const isLoading = useStaffMenuStore((s) => s.isLoading);
  const errorMsg = useStaffMenuStore((s) => s.errorMsg);
  const setError = useStaffMenuStore((s) => s.setError);

  const existing = menu?.items.find((i) => i.id === itemId);
  const isEdit = !!itemId;

  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  // categoryId stored as string (matches MenuCategory.id)
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [calories, setCalories] = useState(existing?.calories?.toString() ?? "");
  const [tag, setTag] = useState(existing?.tag ?? "");
  const [isActive, setIsActive] = useState(existing?.status === "active" || !existing);

  const [availability, setAvailability] = useState<AvailabilityWindow>(
    existing?.availability ?? { startTime: "08:00", endTime: "22:00", allDays: true, days: [] }
  );

  const [variants, setVariants] = useState<Variant[]>(existing?.variants ?? []);
  const [modifiers, setModifiers] = useState<Modifier[]>(existing?.modifiers ?? []);

  const [nameError, setNameError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  type ImageState = { file?: File; preview: string; isExisting?: boolean };
  const [itemImages, setItemImages] = useState<ImageState[]>(
    existing?.imageUrls?.map(url => ({ preview: url, isExisting: true })) || []
  );

  const { user } = useAuthStore();
  const propertyId = user?.propertyId;

  // Fetch categories on mount
  useEffect(() => {
    if (propertyId && categories.length === 0) {
      fetchCategories(Number(propertyId));
    }
  }, [propertyId, categories.length, fetchCategories]);

  const back = () => router.push(`/staff/menu/${menuId}`);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImages(prev => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedImage = (index: number) => {
    setItemImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    let hasErr = false;
    if (!name.trim()) { setNameError(true); hasErr = true; }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) { setPriceError(true); hasErr = true; }
    if (!categoryId) { setCategoryError(true); hasErr = true; }
    if (hasErr) return;

    const uploadedUrls = itemImages.filter(img => img.isExisting).map(img => img.preview);
    const newFiles = itemImages.filter(img => !img.isExisting && img.file).map(img => img.file!);

    if (newFiles.length > 0) {
      try {
        for (const file of newFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "menu_items");
          const res = await api.post("/images/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data?.url) uploadedUrls.push(res.data.url);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        setError("One or more images failed to upload. Please try again.");
        return;
      }
    }

    if (!propertyId) {
      setError("No property identified. Please refresh or log in again.");
      return;
    }

    const data = {
      name,
      price: Number(price),
      description,
      categoryId,
      status: isActive ? ("active" as const) : ("draft" as const),
      calories: calories ? Number(calories) : undefined,
      tag: tag || undefined,
      imageUrls: uploadedUrls,
      availability,
      variants: variants.map(v => ({
        ...v,
        id: v.id.startsWith('vn-') ? undefined : v.id
      })) as Variant[],
      modifiers: modifiers.map(m => ({
        ...m,
        id: m.id.startsWith('mn-') ? undefined : m.id
      })) as Modifier[],
    };

    try {
      if (isEdit && itemId) {
        await updateItem(menuId, itemId, data);
        setSuccess(`Item "${name}" updated.`);
      } else {
        await addItem(menuId, data, propertyId);
        setSuccess(`Item "${name}" added.`);
      }
      back();
    } catch {
      // errorMsg is set by the store
    }
  };

  /* ─── Variant helpers ─── */
  const addVariant = () => setVariants((v) => [...v, { id: `vn-${variantUid++}`, label: "", price: 0 }]);
  const removeVariant = (id: string) => setVariants((v) => v.filter((x) => x.id !== id));
  const updateVariant = (id: string, key: keyof Variant, val: string | number) =>
    setVariants((v) => v.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  /* ─── Modifier helpers ─── */
  const addModifier = () => setModifiers((m) => [...m, { id: `mn-${modifierUid++}`, name: "", options: [{ label: "", price: 0 }] }]);
  const removeModifier = (id: string) => setModifiers((m) => m.filter((x) => x.id !== id));
  const updateModifierName = (id: string, n: string) => setModifiers((m) => m.map((x) => (x.id === id ? { ...x, name: n } : x)));
  const addOption = (modId: string) =>
    setModifiers((m) => m.map((x) => (x.id === modId ? { ...x, options: [...x.options, { label: "", price: 0 }] } : x)));
  const removeOption = (modId: string, idx: number) =>
    setModifiers((m) => m.map((x) => (x.id === modId ? { ...x, options: x.options.filter((_, i) => i !== idx) } : x)));
  const updateOption = (modId: string, idx: number, key: "label" | "price", val: string | number) =>
    setModifiers((m) =>
      m.map((x) =>
        x.id === modId
          ? { ...x, options: x.options.map((o, i) => (i === idx ? { ...o, [key]: val } : o)) }
          : x
      )
    );

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string) => {
    setAvailability((a) => {
      const days = a.days.includes(day) ? a.days.filter((d) => d !== day) : [...a.days, day];
      return { ...a, days, allDays: false };
    });
  };

  if (!menu) {
    return <div className="h-full flex items-center justify-center"><p className="text-sm text-[var(--gray-3)]">Menu not found.</p></div>;
  }

  /* ─── Shared input styles ─── */
  const inputCls = "w-full text-xs rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)]";
  const errCls = "w-full text-xs rounded-[8px] border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]";
  const labelCls = "text-[10px] font-bold text-[var(--black-2)] uppercase";

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={back} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--black-2)] leading-tight">{isEdit ? "Edit Item" : "Add New Item"}</h1>
            <p className="text-[10px] text-[var(--gray-3)]">{menu.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={back}>Cancel</Button>
          <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={handleSave} disabled={isLoading}>
            <Save size={12} /> {isLoading ? "Saving..." : "Save Item"}
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

      {/* Body — 2-column, scrollable left */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left column — scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {/* Basic Details */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-[var(--black-2)]">Basic Details</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className={labelCls}>Item Name <span className="text-[var(--state-error)]">*</span></Label>
                  <Input value={name} onChange={(e) => { setName(e.target.value); setNameError(false); }} placeholder="e.g. Margherita Pizza" className={nameError ? errCls : inputCls} />
                </div>
                <div>
                  <Label className={labelCls}>Price (LKR) <span className="text-[var(--state-error)]">*</span></Label>
                  <Input value={price} onChange={(e) => { setPrice(e.target.value); setPriceError(false); }} placeholder="e.g. 3000" className={priceError ? errCls : inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className={labelCls}>Category <span className="text-[var(--state-error)]">*</span></Label>
                  {categories.length === 0 ? (
                    <div className={`${categoryError ? errCls : inputCls} h-9 flex items-center px-3 text-[var(--gray-4)] border rounded-[8px]`}>
                      <span className="text-xs">No categories — add one on the Menu list page</span>
                    </div>
                  ) : (
                    <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setCategoryError(false); }}>
                      <SelectTrigger className={categoryError ? errCls : inputCls}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {categoryError && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Please select a category.</p>}
                </div>
                <div>
                  <Label className={labelCls}>Calories <span className="text-[var(--gray-3)] normal-case font-normal">(optional)</span></Label>
                  <Input value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="e.g. 450" className={inputCls} />
                </div>
              </div>
              <div>
                <Label className={labelCls}>Tag <span className="text-[var(--gray-3)] normal-case font-normal">(optional)</span></Label>
                <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. POPULAR, VEG, SPICY" className={inputCls} />
              </div>
              <div>
                <Label className={labelCls}>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the dish..." rows={2} className={`${inputCls} resize-none`} />
              </div>
            </CardContent>
          </Card>

          {/* Availability Settings */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--black-2)]">Availability Settings</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--gray-3)]">{isActive ? "Active" : "Inactive"}</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[var(--brand-primary)] scale-90" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className={labelCls}><Clock size={10} className="inline mr-1" />Start Time</Label>
                  <Input type="time" value={availability.startTime} onChange={(e) => setAvailability((a) => ({ ...a, startTime: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <Label className={labelCls}><Clock size={10} className="inline mr-1" />End Time</Label>
                  <Input type="time" value={availability.endTime} onChange={(e) => setAvailability((a) => ({ ...a, endTime: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={availability.allDays}
                    onCheckedChange={(checked) => setAvailability((a) => ({ ...a, allDays: !!checked, days: checked ? [] : a.days }))}
                    className="data-[state=checked]:bg-[var(--brand-primary)] data-[state=checked]:border-[var(--brand-primary)]"
                  />
                  <span className="text-[10px] text-[var(--black-2)] font-medium">Apply to all days</span>
                </label>
              </div>
              {!availability.allDays && (
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((d) => (
                    <Button
                      key={d}
                      variant={availability.days.includes(d) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(d)}
                      className={`px-2 py-1 h-auto text-[10px] font-medium ${availability.days.includes(d) ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90" : "text-[var(--gray-2)]"}`}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--black-2)]">Variants</h3>
                  <p className="text-[10px] text-[var(--gray-3)]">Size or portion options with different pricing.</p>
                </div>
                <button onClick={addVariant} className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-primary)] hover:underline">
                  <Plus size={12} /> Add Variant
                </button>
              </div>
              {variants.length === 0 ? (
                <p className="text-[10px] text-[var(--gray-4)] text-center py-2 border border-dashed border-[var(--gray-5)] rounded-lg">No variants configured. Click &quot;Add Variant&quot; to create one.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {variants.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 bg-[rgba(0,0,0,0.015)] rounded-lg px-2.5 py-2">
                      <GripVertical size={12} className="text-[var(--gray-4)] shrink-0" />
                      <div className="flex-1">
                        <Input value={v.label} onChange={(e) => updateVariant(v.id, "label", e.target.value)} placeholder="Label (e.g. Small)" className="px-2 py-1 text-xs rounded-md border-[var(--gray-5)] focus:border-[var(--brand-primary)]" />
                      </div>
                      <div className="w-[100px]">
                        <Input value={v.price || ""} onChange={(e) => updateVariant(v.id, "price", Number(e.target.value) || 0)} placeholder="Price" className="px-2 py-1 text-xs rounded-md border-[var(--gray-5)] focus:border-[var(--brand-primary)]" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--gray-4)] hover:text-[var(--state-error)]" onClick={() => removeVariant(v.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modifiers */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--black-2)]">Add-ons &amp; Modifiers</h3>
                  <p className="text-[10px] text-[var(--gray-3)]">Extra options guests can select (e.g. spice level, toppings).</p>
                </div>
                <button onClick={addModifier} className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-primary)] hover:underline">
                  <Plus size={12} /> Add Group
                </button>
              </div>
              {modifiers.length === 0 ? (
                <p className="text-[10px] text-[var(--gray-4)] text-center py-2 border border-dashed border-[var(--gray-5)] rounded-lg">No modifier groups yet. Click &quot;Add Group&quot; to create one.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {modifiers.map((mod) => (
                    <div key={mod.id} className="border border-[var(--gray-5)] rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Input value={mod.name} onChange={(e) => updateModifierName(mod.id, e.target.value)} placeholder="Group name (e.g. Spice Level)" className="flex-1 px-2 py-1 text-xs font-bold rounded-md border-[var(--gray-5)] focus:border-[var(--brand-primary)]" />
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--gray-4)] hover:text-[var(--state-error)]" onClick={() => removeModifier(mod.id)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                      {mod.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2 pl-3">
                          <span className="text-[10px] text-[var(--gray-4)]">└</span>
                          <Input value={opt.label} onChange={(e) => updateOption(mod.id, oi, "label", e.target.value)} placeholder="Option label" className="flex-1 px-2 py-1 text-xs rounded-md border-[var(--gray-5)] focus:border-[var(--brand-primary)]" />
                          <div className="w-[80px] relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--gray-4)]">+</span>
                            <Input value={opt.price || ""} onChange={(e) => updateOption(mod.id, oi, "price", Number(e.target.value) || 0)} placeholder="0" className="pl-5 pr-2 py-1 text-xs rounded-md border-[var(--gray-5)] focus:border-[var(--brand-primary)]" />
                          </div>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-[var(--gray-4)] hover:text-[var(--state-error)]" onClick={() => removeOption(mod.id, oi)}>
                            <Trash2 size={10} />
                          </Button>
                        </div>
                      ))}
                      <button onClick={() => addOption(mod.id)} className="text-[10px] font-medium text-[var(--brand-primary)] hover:underline self-start pl-3">
                        + Add Option
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — Availability + Images */}
        <div className="w-[240px] shrink-0 flex flex-col gap-3">
          {/* Prominent availability toggle */}
          <Card className={`py-0 gap-0 border rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${isActive ? "border-[var(--state-success)] bg-[rgba(39,174,96,0.04)]" : "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]"}`}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--black-2)]">Availability</h3>
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[var(--state-success)]" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-[var(--state-success)]" : "bg-[var(--state-error)]"}`} />
                <span className={`text-[11px] font-bold ${isActive ? "text-[var(--state-success)]" : "text-[var(--state-error)]"}`}>
                  {isActive ? "Currently Available" : "Currently Unavailable"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--gray-3)]">
                {isActive ? "This item is visible and orderable by guests." : "This item is hidden from the guest menu."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold text-[var(--black-2)] mb-3 uppercase tracking-wider">Item Images</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {itemImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[8px] overflow-hidden border border-[var(--gray-5)] group">
                    <img src={img.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSelectedImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 p-0"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {itemImages.length < 8 && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[var(--gray-5)] rounded-[8px] cursor-pointer hover:border-[var(--brand-primary)] hover:bg-[rgba(149,48,2,0.02)] transition-colors">
                    <Upload size={20} className="text-[var(--gray-4)]" />
                    <span className="text-[10px] text-[var(--gray-4)] mt-1 font-medium">Add Photo</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </div>
              <div className="bg-[rgba(0,0,0,0.02)] rounded-[8px] p-2.5">
                <p className="text-[9px] text-[var(--gray-3)] leading-relaxed">
                  Images help guests choose dishes. High quality photos (1:1 aspect ratio) work best.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick summary */}
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-[var(--black-2)]">Summary</h3>
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--gray-3)]">Variants</span>
                <span className="font-bold text-[var(--black-2)]">{variants.length}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--gray-3)]">Modifier Groups</span>
                <span className="font-bold text-[var(--black-2)]">{modifiers.length}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--gray-3)]">Total Options</span>
                <span className="font-bold text-[var(--black-2)]">{modifiers.reduce((a, m) => a + m.options.length, 0)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[var(--gray-3)]">Available</span>
                <span className="font-bold text-[var(--black-2)]">{availability.allDays ? "All days" : availability.days.join(", ") || "None"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
