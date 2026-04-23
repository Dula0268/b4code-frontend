"use client"

import PriceRangeFilter from "./filters/price-range-filter"
import AmenitiesFilter from "./filters/amenities-filter"
import PropertyTypeFilter from "./filters/property-type-filter"
import GuestRatingFilter from "./filters/guest-rating-filter"
import { Map } from "lucide-react"

// Re-export the shared type so callers can still import from this file
export type { FilterState } from "./filters/filter-types"

// ─── Props ────────────────────────────────────────────────────────────────────
import type { FilterState } from "./filters/filter-types"

interface FiltersSidebarProps {
    filters: FilterState
    onChange: (next: FilterState) => void
    onClear: () => void
    sortBy: string
    onSortChange: (sort: string) => void
    mapOpen: boolean
    onToggleMap: () => void
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
export default function FiltersSidebar(filtersSidebarProps: FiltersSidebarProps) {
    const { filters, onChange, onClear } = filtersSidebarProps;
    return (
        <aside className="w-full min-w-0">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="text-[16px] sm:text-[17px] font-bold text-[#1d1d1d]">Filters</span>
                <button
                    id="clear-all-filters"
                    onClick={onClear}
                    className="text-[12px] sm:text-[13px] text-[#953002] font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                    Clear all
                </button>
            </div>

            {/* ── Sort & Map Controls ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#f0f0f0]">
                <div>
                    <span className="text-[13px] font-bold text-[#828282] uppercase tracking-wider mb-2 block">Sort By</span>
                    <select 
                        value={filtersSidebarProps.sortBy}
                        onChange={(e) => filtersSidebarProps.onSortChange(e.target.value)}
                        className="w-full text-[14px] bg-white border border-[#e0e0e0] rounded-xl px-3 py-2.5 outline-none text-[#1d1d1d] font-medium cursor-pointer hover:border-[#953002]/40 transition-colors"
                    >
                        <option value="recommended">Recommended</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>

                <button
                    onClick={filtersSidebarProps.onToggleMap}
                    className={[
                        "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap border-2 w-full",
                        filtersSidebarProps.mapOpen
                            ? "bg-[#953002] text-white border-[#953002] hover:bg-[#6d2200]"
                            : "bg-[#fff4eb] text-[#953002] border-transparent hover:border-[#953002]/20",
                    ].join(" ")}
                >
                    <Map size={18} />
                    {filtersSidebarProps.mapOpen ? "Hide Map" : "Show Map"}
                </button>
            </div>

            {/* ── 1. Price Range ────────────────────────────────────────────────── */}
            <PriceRangeFilter
                priceMin={filters.priceMin}
                priceMax={filters.priceMax}
                onChange={({ priceMin, priceMax }) =>
                    onChange({ ...filters, priceMin, priceMax })
                }
            />

            {/* ── 2. Amenities ─────────────────────────────────────────────────── */}
            <AmenitiesFilter
                selected={filters.amenities}
                onChange={amenities => onChange({ ...filters, amenities })}
            />

            {/* ── 3. Property Type ─────────────────────────────────────────────── */}
            <PropertyTypeFilter
                selected={filters.propertyTypes}
                onChange={propertyTypes => onChange({ ...filters, propertyTypes })}
            />

            {/* ── 4. Guest Rating ──────────────────────────────────────────────── */}
            <GuestRatingFilter
                selected={filters.guestRating}
                onChange={guestRating => onChange({ ...filters, guestRating })}
            />

        </aside>
    )
}
