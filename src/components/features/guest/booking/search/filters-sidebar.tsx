"use client"

import PriceRangeFilter from "./filters/price-range-filter"
import AmenitiesFilter from "./filters/amenities-filter"
import PropertyTypeFilter from "./filters/property-type-filter"
import GuestRatingFilter from "./filters/guest-rating-filter"

// Re-export the shared type so callers can still import from this file
export type { FilterState } from "./filters/filter-types"

// ─── Props ────────────────────────────────────────────────────────────────────
import type { FilterState } from "./filters/filter-types"

interface FiltersSidebarProps {
    filters: FilterState
    onChange: (next: FilterState) => void
    onClear: () => void
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
export default function FiltersSidebar({ filters, onChange, onClear }: FiltersSidebarProps) {
    return (
        <aside className="w-[256px] flex-shrink-0">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-[17px] font-bold text-[#1d1d1d]">Filters</span>
                <button
                    id="clear-all-filters"
                    onClick={onClear}
                    className="text-[13px] text-[#953002] font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                    Clear all
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
