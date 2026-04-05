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
}: ResultsHeaderProps) {

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
                        className="text-[clamp(24px,5vw,28px)] font-bold text-[var(--fg)] mb-0.5"
                        style={{ lineHeight: "1.2" }}
                    >
                        Stays in {destination || "Sri Lanka"}
                    </h1>
                    {subtitle && (
                        <p className="text-[12px] sm:text-[13px] text-[var(--muted)]">{subtitle}</p>
                    )}
                </div>

            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {activeFilters.map(f => (
                        <div
                            key={f.id}
                            className="flex items-center gap-1 sm:gap-1.5 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-medium text-[var(--brand-primary)]"
                        >
                            <span className="truncate">{f.label}</span>
                            {onRemoveFilter && (
                                <button
                                    onClick={() => onRemoveFilter(f.id)}
                                    aria-label={`Remove ${f.label} filter`}
                                    className="text-[var(--brand-primary)]/70 hover:text-[var(--brand-primary)] cursor-pointer bg-transparent border-none p-0 leading-none flex-shrink-0"
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
