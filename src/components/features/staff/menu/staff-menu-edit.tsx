"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Pencil, Trash2, LayoutGrid, List, UtensilsCrossed, Flame } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import type { MenuItem } from "@/store/staff/menu/staff-menu.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function StaffMenuEdit({ menuId }: { menuId: string }) {
  const router = useRouter();
  const menu = useStaffMenuStore((s) => s.getMenu(menuId));
  const deleteItem = useStaffMenuStore((s) => s.deleteItem);
  const toggleItemStatus = useStaffMenuStore((s) => s.toggleItemStatus);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = useMemo(() => {
    if (!menu) return [];
    const cats = new Set(menu.items.map((i) => i.category));
    return ["All Categories", ...Array.from(cats)];
  }, [menu]);

  const filteredItems = useMemo(() => {
    if (!menu) return [];
    return menu.items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || item.category === category;
      return matchSearch && matchCat;
    });
  }, [menu, search, category]);

  if (!menu) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-[var(--gray-3)]">Menu not found.</p>
      </div>
    );
  }

  const statusBadge = (item: MenuItem) => {
    const isActive = item.status === "active";
    const label = item.tag || (isActive ? "Active" : "Draft");
    return (
      <Badge variant="outline" className={`text-[9px] font-bold uppercase border-0 ${
        isActive ? "bg-[rgba(39,174,96,0.08)] text-[var(--state-success)]" : "bg-[rgba(130,130,130,0.08)] text-[var(--gray-3)]"
      }`}>
        {label}
      </Badge>
    );
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
            <p className="text-[10px] text-[var(--gray-3)]">{menu.type}</p>
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
                {/* Image placeholder */}
                <div className="h-24 bg-gradient-to-br from-[var(--gray-5)] to-[rgba(149,48,2,0.05)] relative flex items-center justify-center">
                  <UtensilsCrossed size={20} className="text-[var(--gray-4)]" />
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
                    <Switch
                      checked={item.status === "active"}
                      onCheckedChange={() => toggleItemStatus(menuId, item.id)}
                      className="data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Link href={`/staff/menu/${menuId}/items/${item.id}`} className="flex-1 text-center py-1 text-[10px] font-bold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.06)] rounded-md hover:bg-[rgba(149,48,2,0.12)] transition-colors">
                      EDIT
                    </Link>
                    <button onClick={() => deleteItem(menuId, item.id)} className="p-1 text-[var(--gray-4)] hover:text-[var(--state-error)] transition-colors">
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--gray-5)] to-[rgba(149,48,2,0.05)] flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={14} className="text-[var(--gray-4)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--black-2)]">{item.name}</p>
                  <p className="text-[10px] text-[var(--gray-3)] truncate">{item.description}</p>
                </div>
                {statusBadge(item)}
                <span className="text-xs font-bold text-[var(--brand-primary)] shrink-0">LKR {item.price.toLocaleString()}</span>
                {item.calories && <span className="text-[10px] text-[var(--gray-3)] flex items-center gap-0.5 shrink-0"><Flame size={10} />{item.calories}</span>}
                <Switch
                  checked={item.status === "active"}
                  onCheckedChange={() => toggleItemStatus(menuId, item.id)}
                  className="shrink-0 data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                />
                <Link href={`/staff/menu/${menuId}/items/${item.id}`} className="text-[10px] font-bold text-[var(--brand-primary)] hover:underline shrink-0">EDIT</Link>
                <button onClick={() => deleteItem(menuId, item.id)} className="p-1 text-[var(--gray-4)] hover:text-[var(--state-error)] transition-colors shrink-0">
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
