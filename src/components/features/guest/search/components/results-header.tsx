"use client"

import { useState } from "react"
import { Map, ChevronDown, X } from "lucide-react"

interface ActiveFilter {
    id: string
    label: string
}

interface ResultsHeaderProps {
    destination: string
    totalCount: number
    checkIn?: string
    checkOut?: string
    guests?: number
    activeFilters?: ActiveFilter[]
    onRemoveFilter?: (id: string) => void
    sortBy: string
    onSortChange: (sort: string) => void
    mapOpen: boolean
    onToggleMap: () => void
}

const SORT_OPTIONS = [
    { value: "recommended", label: "Recommended" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
]

export default function ResultsHeader({
    destination,
    totalCount,
    checkIn,
    checkOut,
    guests,
    activeFilters = [],
    onRemoveFilter,
    sortBy,
    onSortChange,
    mapOpen,
    onToggleMap,
}: ResultsHeaderProps) {
    const [sortOpen, setSortOpen] = useState(false)

    const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Recommended"

    const subtitle = [
        `${totalCount} stays`,
        checkIn && checkOut ? `${checkIn} - ${checkOut}` : null,
        guests ? `${guests} Guest${guests !== 1 ? "s" : ""}` : null,
    ]
        .filter(Boolean)
        .join(" · ")

    return (
        <div className="mb-4 sm:mb-6">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
                <div className="flex-1">
                    <h1
                        className="text-[clamp(24px,5vw,28px)] font-bold text-[#1d1d1d] mb-0.5"
                        style={{ lineHeight: "1.2" }}
                    >
                        Stays in {destination || "Sri Lanka"}
                    </h1>
                    {subtitle && (
                        <p className="text-[12px] sm:text-[13px] text-[#828282]">{subtitle}</p>
                    )}
                </div>

                {/* Sort + Map controls */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Sort dropdown */}
                    <div className="relative flex-1 sm:flex-none">
                        <button
                            id="sort-by-btn"
                            onClick={() => setSortOpen(o => !o)}
                            className="flex items-center gap-1 sm:gap-1.5 bg-white border border-[#e0e0e0] rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1d] hover:border-[#953002]/40 transition-colors shadow-sm cursor-pointer w-full sm:w-auto justify-between sm:justify-start"
                        >
                            <span className="text-[#828282] font-normal hidden sm:inline">Sort:</span>
                            <span className="truncate">{sortLabel}</span>
                            <ChevronDown size={14} className={`transition-transform flex-shrink-0 ${sortOpen ? "rotate-180" : ""}`} />
                        </button>

                        {sortOpen && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-20 w-48 sm:w-52 overflow-hidden">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSortChange(opt.value); setSortOpen(false) }}
                                        className={[
                                            "w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] transition-colors cursor-pointer border-none",
                                            sortBy === opt.value
                                                ? "bg-[#953002]/5 text-[#953002] font-medium"
                                                : "text-[#333333] hover:bg-gray-50",
                                        ].join(" ")}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Show / Hide map - hidden on mobile */}
                    <button
                        id="show-map-btn"
                        onClick={onToggleMap}
                        className={[
                            "hidden sm:flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap border-2",
                            mapOpen
                                ? "bg-[#953002] text-white border-[#953002] hover:bg-[#6d2200]"
                                : "bg-white text-[#1d1d1d] border-[#e0e0e0] hover:border-[#953002]/40",
                        ].join(" ")}
                    >
                        <Map size={14} />
                        {mapOpen ? "Hide" : "Show"} map
                    </button>
                </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {activeFilters.map(f => (
                        <div
                            key={f.id}
                            className="flex items-center gap-1 sm:gap-1.5 bg-[#953002]/8 border border-[#953002]/30 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-medium text-[#953002]"
                        >
                            <span className="truncate">{f.label}</span>
                            {onRemoveFilter && (
                                <button
                                    onClick={() => onRemoveFilter(f.id)}
                                    aria-label={`Remove ${f.label} filter`}
                                    className="text-[#953002]/70 hover:text-[#953002] cursor-pointer bg-transparent border-none p-0 leading-none flex-shrink-0"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
