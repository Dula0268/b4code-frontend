"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CircleDot, Clock } from "lucide-react";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function StaffAvailableItems() {
  const router = useRouter();
  const menus = useStaffMenuStore((s) => s.menus);
  const toggleItemStatus = useStaffMenuStore((s) => s.toggleItemStatus);

  const [search, setSearch] = useState("");
  const [menuFilter, setMenuFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");

  // Flatten all items across menus
  const allItems = useMemo(() => {
    return menus.flatMap((menu) =>
      menu.items.map((item) => ({ ...item, menuId: menu.id, menuName: menu.name }))
    );
  }, [menus]);

  // Check if item is currently available based on status + time + day
  const isAvailableNow = (item: (typeof allItems)[0]) => {
    if (item.status !== "active") return false;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const { startTime, endTime, allDays, days } = item.availability;
    if (currentTime < startTime || currentTime > endTime) return false;
    if (!allDays) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = dayNames[now.getDay()];
      if (!days.includes(today)) return false;
    }
    return true;
  };

  // Filtered + searched items
  const filtered = useMemo(() => {
    let list = allItems;
    if (menuFilter !== "all") list = list.filter((i) => i.menuId === menuFilter);
    if (statusFilter === "available") list = list.filter((i) => i.status === "active");
    if (statusFilter === "unavailable") list = list.filter((i) => i.status === "draft");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, menuFilter, statusFilter, search]);

  const availableCount = allItems.filter((i) => i.status === "active").length;
  const unavailableCount = allItems.filter((i) => i.status === "draft").length;

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push("/staff/menu")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--black-2)] leading-tight">Item Availability</h1>
            <p className="text-[10px] text-[var(--gray-3)]">Toggle item availability across all menus in real-time.</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex-none flex gap-3">
        <Card className="bg-white flex-1 py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CardContent className="px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(39,174,96,0.08)] flex items-center justify-center">
              <CircleDot size={14} className="text-[var(--state-success)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--black-2)] leading-tight">{availableCount}</p>
              <p className="text-[10px] text-[var(--gray-3)]">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white flex-1 py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CardContent className="px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(235,87,87,0.08)] flex items-center justify-center">
              <CircleDot size={14} className="text-[var(--state-error)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--black-2)] leading-tight">{unavailableCount}</p>
              <p className="text-[10px] text-[var(--gray-3)]">Unavailable</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white flex-1 py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CardContent className="px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(149,48,2,0.08)] flex items-center justify-center">
              <Clock size={14} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--black-2)] leading-tight">{allItems.filter(isAvailableNow).length}</p>
              <p className="text-[10px] text-[var(--gray-3)]">Serving Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex-none flex items-center gap-2.5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-4)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or category..."
            className="pl-8 text-xs rounded-[8px] border-[var(--gray-5)] focus:border-[var(--brand-primary)]"
          />
        </div>
        <Select value={menuFilter} onValueChange={setMenuFilter}>
          <SelectTrigger className="w-[160px] text-xs rounded-[8px] border-[var(--gray-5)]">
            <SelectValue placeholder="All Menus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Menus</SelectItem>
            {menus.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "available" | "unavailable")}>
          <SelectTrigger className="w-[140px] text-xs rounded-[8px] border-[var(--gray-5)]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="available" className="text-xs">Available</SelectItem>
            <SelectItem value="unavailable" className="text-xs">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <p className="text-xs font-bold text-[var(--gray-3)]">No items found</p>
            <p className="text-[10px] text-[var(--gray-4)]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const live = isAvailableNow(item);
            return (
              <Card key={`${item.menuId}-${item.id}`} className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <CardContent className="px-4 py-2.5 flex items-center gap-3">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${live ? "bg-[var(--state-success)]" : item.status === "active" ? "bg-[var(--brand-secondary)]" : "bg-[var(--gray-4)]"}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[var(--black-2)] truncate">{item.name}</p>
                      <Badge variant="outline" className="text-[8px] border-0 bg-[rgba(149,48,2,0.06)] text-[var(--brand-primary)] px-1.5 py-0">{item.categoryName}</Badge>
                      {live && <Badge className="text-[8px] border-0 bg-[rgba(39,174,96,0.1)] text-[var(--state-success)] px-1.5 py-0">Serving Now</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-[var(--gray-3)]">{item.menuName}</span>
                      <span className="text-[10px] font-medium text-[var(--brand-primary)]">LKR {item.price.toLocaleString()}</span>
                      <span className="text-[10px] text-[var(--gray-4)]">
                        {item.availability.allDays ? "All days" : item.availability.days.join(", ")} &middot; {item.availability.startTime}–{item.availability.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <Switch
                    checked={item.status === "active"}
                    onCheckedChange={() => toggleItemStatus(item.menuId, item.id)}
                    className="shrink-0 data-[state=checked]:bg-[var(--state-success)] data-[state=unchecked]:bg-[var(--gray-4)]"
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
