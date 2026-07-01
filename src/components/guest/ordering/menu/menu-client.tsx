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
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-lg font-bold text-[var(--black-2)]">Invalid Request</p>
          <p className="text-sm text-[var(--gray-3)] mt-1">{paramError}</p>
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
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-lg font-bold text-[var(--black-2)]">Unable to load menu</p>
          <p className="text-sm text-[var(--gray-3)] mt-1">{menuError}</p>
          <Button
            onClick={() => {
              const pId = qrContext?.propertyId || user?.propertyId;
              if (pId && !isNaN(Number(pId))) {
                fetchMenu(Number(pId));
              }
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-container">
      <div className="grid grid-cols-12 gap-3 md:gap-[30px] py-3 md:py-8">
        {/* LEFT */}
        <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
          {/* category pills row — horizontally scrollable on mobile */}
          <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto pb-1.5 md:pb-0 md:flex-wrap scrollbar-hide">
            {categoryNames.map((c) => {
              const active = c === activeCategory;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
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
            <h3 className="text-[#111827] text-base md:text-2xl font-bold">
              {activeCategory === "All Items" ? "All Dishes" : activeCategory}
              <span className="text-sm font-normal text-[var(--gray-3)] ml-2">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            </h3>

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
                  <p className="text-sm text-[var(--gray-3)] mt-1">
                    {allItems.length === 0
                      ? "The menu hasn't been set up yet. Please check back later."
                      : "Try adjusting your search or filters"}
                  </p>
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
