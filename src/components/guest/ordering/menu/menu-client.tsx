"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useCartStore, type MenuItem } from "@/store/guest/ordering/cart.store";
import { useGuestMenuStore } from "@/store/guest/ordering/menu.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { useSearchParams } from "next/navigation";
import MenuItemCard from "./menu-item-card";
import OrderSidebar from "./order-sidebar";
import { MenuSkeleton } from "@/components/guest/ordering/menu/menu-skeleton";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const TAG_OPTIONS: { value: string; label: string }[] = [
  { value: "POPULAR", label: "Popular" },
  { value: "VEG", label: "Veg" },
  { value: "SPICY", label: "Spicy" },
  { value: "NON_VEG", label: "Non Veg" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function MenuClient() {
  const add = useCartStore((s) => s.add);
  const itemCount = useCartStore((s) => s.itemCount());

  // Guest menu store — fetches from API
  const categories = useGuestMenuStore((s) => s.categories);
  const fetchMenu = useGuestMenuStore((s) => s.fetchMenu);
  const menuLoading = useGuestMenuStore((s) => s.loading);
  const menuError = useGuestMenuStore((s) => s.error);

  // QR context provides the propertyId
  const qrContext = useOrderContextStore((s) => s.qrContext);

  // Local UI state
  const [activeCategory, setActiveCategory] = React.useState<string>("All Items");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [tagFilters, setTagFilters] = React.useState<Set<string>>(new Set());

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const filterRef = React.useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const setQRContext = useOrderContextStore((s) => s.setQRContext);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [paramError, setParamError] = React.useState<string | null>(null);

  // Validate parameters and initialize context on landing
  React.useEffect(() => {
    async function initializeContext() {
      if (!searchParams) {
        setIsInitializing(false);
        return;
      }

      const propIdStr = searchParams.get("propertyId");
      const locationStr = searchParams.get("location");
      const qrIdStr = searchParams.get("qrId");

      // For walk-in guests, we STRICTLY REQUIRE the URL to contain a valid QR ID,
      // UNLESS they already have an active QR context in their session.
      const currentContext = useOrderContextStore.getState().qrContext;
      
      if (!qrIdStr && !useAuthStore.getState().user && !currentContext) {
        useOrderContextStore.getState().reset();
        setParamError("Please scan a valid QR code to access the menu.");
        setIsInitializing(false);
        return;
      }

      let parsedLocation: string | undefined = locationStr || undefined;
      let qrName = "";
      let qrType = "";
      let propId = propIdStr ? Number(propIdStr) : undefined;

      if (qrIdStr) {
        try {
          const { default: api } = await import("@/lib/axios");
          const response = await api.get(`/qr/unique/${qrIdStr}`);
          const qrData = response.data;
          
          if (qrData) {
            qrName = qrData.name || "QR Location";
            qrType = qrData.type?.toUpperCase() || "TABLE";
            propId = qrData.propertyId;
            
            
            if (qrData.location) {
              parsedLocation = qrData.location;
            }
          }
        } catch (e) {
          console.error("Failed to fetch QR details:", e);
        }
      }

      // If no query parameters are provided and we failed to get one, check logged-in context
      if (!propId && !parsedLocation) {
        const currentPropId = qrContext?.propertyId || user?.propertyId;
        if (currentPropId) {
          setIsInitializing(false);
          return;
        }
        setParamError("Invalid request. Missing property identifier.");
        setIsInitializing(false);
        return;
      }

      // 1. Validate propertyId
      if (!propId || isNaN(propId)) {
        setParamError("Invalid request. Missing property identifier.");
        setIsInitializing(false);
        return;
      }

      // QR data already fetched if qrIdStr exists.

      // 2. Validate location (must be provided)
      if (!parsedLocation) {
        setParamError("Invalid request. Missing location identifier.");
        setIsInitializing(false);
        return;
      }

      // Check if current context already matches the parsed parameters to prevent redundant updates
      if (qrContext &&
          qrContext.propertyId === propId &&
          qrContext.location === parsedLocation) {
        setIsInitializing(false);
        return;
      }

      // 3. Verify property existence and fetch its name
      try {
        let propertyName = "Property Name";
        const { propertiesApi } = await import("@/api/properties/properties.api");
        const list = await propertiesApi.getPublicList();
        const prop = list.find((p) => p.id === propId);
        
        if (prop) {
          propertyName = prop.name;
        } else {
          setParamError("Invalid request. The specified property does not exist.");
          setIsInitializing(false);
          return;
        }

        // Set the Order/QR context in the store
        setQRContext({
          qrId: qrIdStr || `scan-${propId}-${parsedLocation}`,
          propertyId: propId,
          location: parsedLocation,
          propertyName: propertyName,
          locationLabel: qrName || parsedLocation,
          type: qrType || "LOCATION",
          name: qrName || parsedLocation,
          status: "ACTIVE",
        });

        setIsInitializing(false);
      } catch (err) {
        console.error("Error resolving property context:", err);
        setParamError("Failed to verify property details. Please try again.");
        setIsInitializing(false);
      }
    }

    initializeContext();
  }, [searchParams, setQRContext, qrContext, user?.propertyId]);

  // Fetch menu from API when propertyId is available (from QR or Session)
  React.useEffect(() => {
    const propertyId = qrContext?.propertyId || user?.propertyId;
    const location = qrContext?.location; // or user location? user doesn't have location yet.
    
    if (propertyId && !isNaN(Number(propertyId))) {
      fetchMenu(Number(propertyId));
    }
  }, [qrContext?.propertyId, qrContext?.location, user?.propertyId, fetchMenu]);

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

  const toggleTag = (tag: string) => {
    setTagFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // Build category list from API data
  const categoryNames = React.useMemo(() => {
    return ["All Items", ...categories.map((c) => c.name)];
  }, [categories]);

  // Flatten all items from categories and convert to cart-compatible format
  const allItems: MenuItem[] = React.useMemo(() => {
    return categories.flatMap((cat) =>
      cat.items.map((item) => ({
        id: String(item.id),
        name: item.name,
        title: item.title || item.name,
        description: item.description || "",
        price: item.price,
        priceLkr: item.priceLkr || item.price,
        imageUrl: item.imageUrl,
        tag: item.tag,
        category: item.category || cat.name,
        variants: item.variants,
        modifiers: item.modifiers,
      }))
    );
  }, [categories]);

  // Filter and sort items
  const items = React.useMemo(() => {
    let result = [...allItems];

    // Category filter
    if (activeCategory !== "All Items") {
      result = result.filter((i) => i.category === activeCategory);
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
  }, [allItems, activeCategory, searchQuery, tagFilters, sortBy]);

  const hasActiveFilters = tagFilters.size > 0 || sortBy !== "default";

  if (isInitializing) {
    return <MenuSkeleton />;
  }

  // Parameter validation error state
  if (paramError) {
    return (
      <div className="ps-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50/80 flex items-center justify-center mb-4 border border-red-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900 tracking-tight">Invalid Request</p>
          <p className="text-sm text-gray-500 font-medium mt-2">{paramError}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (menuLoading) {
    return <MenuSkeleton />;
  }

  // Error state
  if (menuError) {
    return (
      <div className="ps-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50/80 flex items-center justify-center mb-4 border border-red-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900 tracking-tight">Unable to load menu</p>
          <p className="text-sm text-gray-500 font-medium mt-2 mb-6">{menuError}</p>
          <Button
            onClick={() => {
              const pId = qrContext?.propertyId || user?.propertyId;
              if (pId && !isNaN(Number(pId))) {
                fetchMenu(Number(pId));
              }
            }}
            className="rounded-xl font-semibold w-full shadow-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-container">
      <div className="grid grid-cols-12 gap-4 md:gap-8 py-4 md:py-8">
        {/* LEFT */}
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          {/* category pills row — horizontally scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 md:flex-wrap scrollbar-hide">
            {categoryNames.map((c) => {
              const active = c === activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={[
                    "h-8 md:h-9 rounded-full border px-4 md:px-5 text-xs md:text-[13px] font-semibold transition-all duration-300 whitespace-nowrap shrink-0 shadow-sm",
                    active
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-[0_4px_12px_rgba(217,119,6,0.2)] hover:-translate-y-0.5"
                      : "bg-white/60 backdrop-blur-md text-gray-700 border-white/40 hover:bg-white hover:border-gray-200 hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-gray-900 text-lg md:text-xl font-bold tracking-tight">
              {activeCategory === "All Items" ? "All Dishes" : activeCategory}
              <span className="text-xs font-medium text-gray-400 ml-2">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            </h3>

            {/* right-side icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search toggle button */}
              <Button
                variant="outline"
                size="icon"
                className={[
                  "h-10 w-10 rounded-xl transition-all duration-300 shadow-sm",
                  searchOpen ? "bg-[var(--brand-primary)] text-white border-transparent" : "bg-white/60 backdrop-blur-md border-white/40 text-gray-600 hover:bg-white hover:border-gray-200",
                ].join(" ")}
                aria-label="Search"
                onClick={() => {
                  setSearchOpen((prev) => {
                    if (prev) setSearchQuery("");
                    return !prev;
                  });
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Button>

              {/* Filter/Sort toggle button */}
              <div className="relative" ref={filterRef}>
                <Button
                  variant="outline"
                  size="icon"
                  className={[
                    "h-11 w-11 rounded-xl transition-all duration-300 shadow-sm",
                    filterOpen ? "bg-[var(--brand-primary)] text-white border-transparent" : "bg-white/60 backdrop-blur-md border-white/40 text-gray-600 hover:bg-white hover:border-gray-200",
                  ].join(" ")}
                  aria-label="Sort/Filter"
                  onClick={() => setFilterOpen((prev) => !prev)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                  )}
                </Button>

                {/* Filter/Sort dropdown */}
                {filterOpen && (
                  <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    {/* Sort section */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Sort By
                      </p>
                      <div className="space-y-1.5">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={[
                              "w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center justify-between",
                              sortBy === opt.value
                                ? "bg-orange-50 text-[var(--brand-primary)]"
                                : "text-gray-700 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {opt.label}
                            {sortBy === opt.value && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Tag filter section */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Filter by Tag
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {TAG_OPTIONS.map((t) => {
                          const active = tagFilters.has(t.value);
                          return (
                            <button
                              key={t.value}
                              onClick={() => toggleTag(t.value)}
                              className={[
                                "h-9 rounded-full border px-4 text-xs font-bold transition-all duration-200",
                                active
                                  ? "bg-[var(--brand-primary)] text-white border-transparent shadow-sm"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-[var(--brand-primary)]/50 hover:bg-orange-50",
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
                        <Separator className="bg-gray-100" />
                        <button
                          onClick={() => {
                            setSortBy("default");
                            setTagFilters(new Set());
                          }}
                          className="w-full text-center text-sm text-[var(--brand-primary)] font-bold hover:text-[#C05621] py-2 transition-colors rounded-xl hover:bg-orange-50"
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
              <div className="relative group">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors"
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                >
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes by name or description…"
                  className="pl-10 pr-10 h-12 rounded-xl bg-white/80 backdrop-blur-md border-white/60 shadow-sm focus-visible:ring-[var(--brand-primary)] focus-visible:border-[var(--brand-primary)] text-sm font-medium placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* cards grid */}
          <div className="mt-3 md:mt-4">
             <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-220px)] pr-1 md:pr-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm mt-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center shadow-inner border border-gray-100 mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900 tracking-tight">No dishes found</p>
                  <p className="text-sm font-medium text-gray-500 mt-2 max-w-[280px]">
                    {allItems.length === 0
                      ? "The menu hasn't been set up yet. Please check back later."
                      : "Try adjusting your search or filters to find what you're looking for."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 pb-24 md:pb-8">
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
          <div className="xl:sticky xl:top-8">
            <OrderSidebar formatLkr={formatLkr} />
            <div className="mt-4 text-right text-sm font-semibold text-gray-400 uppercase tracking-widest px-2">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
            </div>
          </div>
        </div>

        {/* Mobile floating cart bar — shown only on mobile when items in cart */}
        {itemCount > 0 && (
          <div className="xl:hidden fixed bottom-[64px] md:bottom-8 left-0 right-0 z-40 px-4 pointer-events-none pb-safe">
            <div className="flex justify-center w-full">
              <Link href="/guest/order/cart" className="w-full max-w-sm mx-auto pointer-events-auto">
                <div className="flex items-center justify-between bg-[var(--brand-primary)]/95 backdrop-blur-xl text-white rounded-2xl px-5 py-3 shadow-[0_16px_32px_rgba(217,119,6,0.3)] border border-white/20 active:scale-95 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl h-10 w-10 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-sm relative">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {/* Pulse effect */}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[var(--brand-primary)]"></span>
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-wide">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
                      <div className="text-xs font-semibold text-white/80">View cart</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold tracking-tight">{formatLkr(useCartStore.getState().total())}</span>
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="translate-x-[2px]">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
