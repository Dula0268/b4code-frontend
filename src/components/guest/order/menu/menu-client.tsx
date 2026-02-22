"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useCartStore, type MenuItem } from "@/store/guest/order/cart-store";
import { MENU_ITEMS } from "@/data/menu-items";
import MenuItemCard from "./menu-item-card";
import OrderSidebar from "./order-sidebar";

const CATEGORIES: MenuItem["category"][] = [
  "All Items",
  "Starters",
  "Mains",
  "Desserts",
  "Beverages",
];

const TAG_OPTIONS: { value: NonNullable<MenuItem["tag"]>; label: string }[] = [
  { value: "POPULAR", label: "Popular" },
  { value: "VEG", label: "Veg" },
  { value: "SPICY", label: "Spicy" },
  { value: "NON_VEG", label: "Non Veg" },
];

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

const DEMO_ITEMS = MENU_ITEMS;

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function MenuClient() {
  const add = useCartStore((s) => s.add);
  const itemCount = useCartStore((s) => s.itemCount());

  const [category, setCategory] = React.useState<MenuItem["category"]>("All Items");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [tagFilters, setTagFilters] = React.useState<Set<NonNullable<MenuItem["tag"]>>>(new Set());

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const filterRef = React.useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  // Auto-focus search input when opened
  React.useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const toggleTag = (tag: NonNullable<MenuItem["tag"]>) => {
    setTagFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const items = React.useMemo(() => {
    let result = [...DEMO_ITEMS];

    // Category filter
    if (category !== "All Items") {
      result = result.filter((i) => i.category === category);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    // Tag filters
    if (tagFilters.size > 0) {
      result = result.filter((i) => i.tag && tagFilters.has(i.tag));
    }

    // Sort
    if (sortBy === "price-asc") result.sort((a, b) => a.priceLkr - b.priceLkr);
    else if (sortBy === "price-desc") result.sort((a, b) => b.priceLkr - a.priceLkr);
    else if (sortBy === "name-asc") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "name-desc") result.sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [category, searchQuery, tagFilters, sortBy]);

  const hasActiveFilters = tagFilters.size > 0 || sortBy !== "default";

  return (
    <div className="ps-container">
      <div className="grid grid-cols-12 gap-3 md:gap-[30px] py-3 md:py-8">
        {/* LEFT */}
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          {/* category pills row — horizontally scrollable on mobile */}
          <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto pb-1.5 md:pb-0 md:flex-wrap scrollbar-hide">
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={[
                    "h-8 md:h-10 rounded-full border px-3 md:px-5 text-[11px] md:text-sm font-medium transition whitespace-nowrap shrink-0",
                    active
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                      : "bg-white text-[var(--black-2)] border-[var(--gray-5)] hover:border-[var(--brand-primary)]",
                  ].join(" ")}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-3 md:mt-8 flex items-center justify-between">
            <h3 className="text-[#111827] text-base md:text-2xl font-bold">Popular Dishes</h3>

            {/* right-side icons */}
            <div className="flex items-center gap-2">
              {/* Search toggle button */}
              <Button
                variant="outline"
                size="icon"
                className={[
                  "h-10 w-10 rounded-md transition",
                  searchOpen ? "bg-[var(--gray-6)] border-[var(--gray-4)]" : "border-[var(--gray-5)] hover:bg-[var(--gray-6)]",
                ].join(" ")}
                aria-label="Search"
                onClick={() => {
                  setSearchOpen((prev) => {
                    if (prev) setSearchQuery("");
                    return !prev;
                  });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke={searchOpen ? "#111827" : "#6b7280"} strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke={searchOpen ? "#111827" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Button>

              {/* Filter/Sort toggle button */}
              <div className="relative" ref={filterRef}>
                <Button
                  variant="outline"
                  size="icon"
                  className={[
                    "h-10 w-10 rounded-md transition",
                    filterOpen ? "bg-[var(--gray-6)] border-[var(--gray-4)]" : "border-[var(--gray-5)] hover:bg-[var(--gray-6)]",
                  ].join(" ")}
                  aria-label="Sort/Filter"
                  onClick={() => setFilterOpen((prev) => !prev)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke={filterOpen ? "#111827" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--brand-primary)] border-2 border-white" />
                  )}
                </Button>

                {/* Filter/Sort dropdown */}
                {filterOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[var(--gray-5)] bg-white shadow-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Sort section */}
                    <div>
                      <p className="text-xs font-semibold text-[var(--gray-3)] uppercase tracking-wider mb-2">
                        Sort By
                      </p>
                      <div className="space-y-1">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={[
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition",
                              sortBy === opt.value
                                ? "bg-[var(--gray-6)] text-[var(--black-2)] font-medium"
                                : "text-[var(--black-2)] hover:bg-[var(--gray-6)]",
                            ].join(" ")}
                          >
                            {sortBy === opt.value && (
                              <svg className="inline-block mr-2 -mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Tag filter section */}
                    <div>
                      <p className="text-xs font-semibold text-[var(--gray-3)] uppercase tracking-wider mb-2">
                        Filter by Tag
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((t) => {
                          const active = tagFilters.has(t.value);
                          return (
                            <button
                              key={t.value}
                              onClick={() => toggleTag(t.value)}
                              className={[
                                "h-8 rounded-full border px-3 text-xs font-medium transition",
                                active
                                  ? "bg-[var(--gray-6)] text-[var(--black-2)] border-[var(--gray-4)]"
                                  : "bg-white text-[var(--black-2)] border-[var(--gray-5)] hover:bg-[var(--gray-6)] hover:border-[var(--gray-4)]",
                              ].join(" ")}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Clear all */}
                    {hasActiveFilters && (
                      <>
                        <Separator />
                        <button
                          onClick={() => {
                            setSortBy("default");
                            setTagFilters(new Set());
                          }}
                          className="w-full text-center text-sm text-[var(--brand-primary)] font-medium hover:underline py-1"
                        >
                          Clear All Filters
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search input (expandable) */}
          {searchOpen && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                >
                  <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="1.5" />
                  <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes by name or description…"
                  className="pl-10 pr-10 h-11 rounded-lg border-[var(--gray-5)] focus-visible:ring-[var(--gray-4)] focus-visible:border-[var(--gray-4)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-3)] hover:text-[var(--black-2)] transition"
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* cards grid */}
          <div className="mt-3 md:mt-6">
             <ScrollArea className="h-[calc(100vh-48px-200px)] md:h-[calc(100vh-60px-180px)] pr-1 md:pr-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-4 text-[var(--gray-4)]">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-lg font-medium text-[var(--black-2)]">No dishes found</p>
                  <p className="text-sm text-[var(--gray-3)] mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={() => add(item)}
                      formatLkr={formatLkr}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* RIGHT (sticky order summary) — hidden on mobile, shown on xl+ */}
        <div className="hidden xl:block col-span-12 xl:col-span-4 2xl:col-span-3">
          <div className="xl:sticky xl:top-6">
            <OrderSidebar formatLkr={formatLkr} />
            <div className="mt-4 text-right text-sm text-[var(--gray-3)]">
              {itemCount} items
            </div>
          </div>
        </div>

        {/* Mobile floating cart bar — shown only on mobile when items in cart */}
        {itemCount > 0 && (
          <div className="xl:hidden fixed bottom-13 md:bottom-0 left-0 right-0 z-40 px-3 pb-2">
            <Link href="/guest/order/cart">
              <div className="flex items-center justify-between bg-[var(--brand-primary)] text-white rounded-xl px-4 py-3 shadow-[0px_8px_20px_rgba(151,49,2,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg h-8 w-8 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold">{formatLkr(useCartStore.getState().total())}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
