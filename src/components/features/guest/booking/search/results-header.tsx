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
        <div className="mb-6">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                    <h1
                        className="text-[28px] font-bold text-[#1d1d1d] mb-0.5"
                        style={{ fontSize: "28px", fontWeight: 700, color: "#1d1d1d", lineHeight: "1.2" }}
                    >
                        Stays in {destination || "Sri Lanka"}
                    </h1>
                    {subtitle && (
                        <p className="text-[13px] text-[#828282]">{subtitle}</p>
                    )}
                </div>

                {/* Sort + Map controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            id="sort-by-btn"
                            onClick={() => setSortOpen(o => !o)}
                            className="flex items-center gap-1.5 bg-white border border-[#e0e0e0] rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#1d1d1d] hover:border-[#953002]/40 transition-colors shadow-sm cursor-pointer"
                        >
                            <span className="text-[#828282] font-normal">Sort by:</span>
                            {sortLabel}
                            <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                        </button>

                        {sortOpen && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-[#e0e0e0] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-20 w-52 overflow-hidden">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSortChange(opt.value); setSortOpen(false) }}
                                        className={[
                                            "w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer border-none",
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

                    {/* Show / Hide map */}
                    <button
                        id="show-map-btn"
                        onClick={onToggleMap}
                        className={[
                            "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap border-2",
                            mapOpen
                                ? "bg-[#953002] text-white border-[#953002] hover:bg-[#6d2200]"
                                : "bg-white text-[#1d1d1d] border-[#e0e0e0] hover:border-[#953002]/40",
                        ].join(" ")}
                    >
                        <Map size={14} />
                        {mapOpen ? "Hide map" : "Show map"}
                    </button>
                </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {activeFilters.map(f => (
                        <div
                            key={f.id}
                            className="flex items-center gap-1.5 bg-[#953002]/8 border border-[#953002]/30 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#953002]"
                        >
                            {f.label}
                            {onRemoveFilter && (
                                <button
                                    onClick={() => onRemoveFilter(f.id)}
                                    aria-label={`Remove ${f.label} filter`}
                                    className="text-[#953002]/70 hover:text-[#953002] cursor-pointer bg-transparent border-none p-0 leading-none"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
