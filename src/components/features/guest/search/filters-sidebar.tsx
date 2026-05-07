"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Map, Home, Building2, BedDouble, Hotel, Palmtree, TreePine } from "lucide-react"
import type { FilterOptionsResponse, PropertyTypeOption, RatingOption, SortOption } from "@/services/guest/searchApi"

// ─── Types ───────────────────────────────────────────────────────────────────
export interface FilterState {
    priceMin: number
    priceMax: number
    amenities: string[]
    propertyTypes: string[]
    guestRating: string | null
}

interface FiltersSidebarProps {
    filters: FilterState
    onChange: (next: FilterState) => void
    onClear: () => void
    sortBy: string
    onSortChange: (sort: string) => void
    mapOpen: boolean
    onToggleMap: () => void
    filterOptions: FilterOptionsResponse | null
    loading?: boolean
}

// ─── Icon Resolver ────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    Home, Building2, BedDouble, Hotel, Palmtree, TreePine,
}

function resolveIcon(name: string): React.ElementType {
    return ICON_MAP[name] || Home
}

function formatCurrency(v: number, currency?: string) {
    return `${currency || "LKR"} ${v.toLocaleString("en-US")}`
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function FilterSkeleton() {
    return (
        <aside className="w-full min-w-0 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-20 mb-6" />
            <div className="space-y-4 mb-6 pb-6 border-b border-[#f0f0f0]">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="mb-7 pb-7 border-b border-[#e0e0e0]">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(j => <div key={j} className="h-4 bg-gray-200 rounded w-full" />)}
                    </div>
                </div>
            ))}
        </aside>
    )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PriceRangeFilter({
    priceMin, priceMax, absMin, absMax, currency, onChange
}: {
    priceMin: number; priceMax: number; absMin: number; absMax: number; currency: string;
    onChange: (next: Pick<FilterState, "priceMin" | "priceMax">) => void
}) {
    const [minInput, setMinInput] = useState(priceMin.toLocaleString("en-US"))
    const [maxInput, setMaxInput] = useState(priceMax.toLocaleString("en-US"))

    useEffect(() => setMinInput(priceMin.toLocaleString("en-US")), [priceMin])
    useEffect(() => setMaxInput(priceMax.toLocaleString("en-US")), [priceMax])

    const range = absMax - absMin || 1
    const leftPct = ((priceMin - absMin) / range) * 100
    const rightPct = ((priceMax - absMin) / range) * 100

    const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val <= priceMax) onChange({ priceMin: val, priceMax })
    }
    const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val >= priceMin) onChange({ priceMin, priceMax: val })
    }
    const handleMinBlur = () => {
        let val = parseInt(minInput.replace(/\D/g, ''), 10)
        if (isNaN(val)) val = absMin
        val = Math.max(absMin, Math.min(val, priceMax))
        onChange({ priceMin: val, priceMax })
        setMinInput(val.toLocaleString("en-US"))
    }
    const handleMaxBlur = () => {
        let val = parseInt(maxInput.replace(/\D/g, ''), 10)
        if (isNaN(val)) val = absMax
        val = Math.max(priceMin, Math.min(val, absMax))
        onChange({ priceMin, priceMax: val })
        setMaxInput(val.toLocaleString("en-US"))
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") e.currentTarget.blur() }

    // Generate histogram heights dynamically based on range
    const bars = 14
    const heights = Array.from({ length: bars }, (_, i) => 18 + Math.round(Math.sin((i / bars) * Math.PI) * 42))

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-1">Price range</h4>
            <p className="text-[12px] text-[#828282] mb-4">Nightly prices before fees and taxes</p>
            <div className="flex items-end gap-[3px] h-[60px] mb-3">
                {heights.map((h, i) => {
                    const barPct = (i / (bars - 1)) * 100
                    const inRange = barPct >= leftPct && barPct <= rightPct
                    return <div key={i} className="flex-1 rounded-sm transition-colors duration-200" style={{ height: `${h}px`, backgroundColor: inRange ? "var(--brand-primary)" : "#e0e0e0" }} />
                })}
            </div>
            <div className="relative h-6 flex items-center mb-4">
                <div className="absolute left-0 right-0 h-1 rounded bg-[#e0e0e0]" />
                <div className="absolute h-1 rounded bg-[var(--brand-primary)]" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
                <input type="range" min={absMin} max={absMax} step={5000} value={priceMin} onChange={handleMin} aria-label="Minimum price" className="absolute w-full h-1 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto cursor-pointer" style={{ zIndex: priceMin > absMax - 50_000 ? 5 : 3 }} />
                <input type="range" min={absMin} max={absMax} step={5000} value={priceMax} onChange={handleMax} aria-label="Maximum price" className="absolute w-full h-1 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto cursor-pointer" style={{ zIndex: 4 }} />
                <div className="absolute w-5 h-5 rounded-full bg-white border-2 border-[var(--brand-primary)] shadow-md -translate-x-1/2" style={{ left: `${leftPct}%`, zIndex: 2, pointerEvents: "none" }}>
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="absolute w-5 h-5 rounded-full bg-white border-2 border-[var(--brand-primary)] shadow-md -translate-x-1/2" style={{ left: `${rightPct}%`, zIndex: 2, pointerEvents: "none" }} />
            </div>
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Min</label>
                    <div className="flex items-center gap-1 border border-[#e0e0e0] rounded-lg px-3 py-2 bg-white focus-within:border-[var(--brand-primary)] transition-colors">
                        <span className="text-[13px] text-[#828282]">{currency}</span>
                        <input type="text" value={minInput} onChange={e => setMinInput(e.target.value)} onBlur={handleMinBlur} onKeyDown={handleKeyDown} className="text-[13px] text-[#1d1d1d] font-medium bg-transparent outline-none w-full min-w-0" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Max</label>
                    <div className="flex items-center gap-1 border border-[#e0e0e0] rounded-lg px-3 py-2 bg-white focus-within:border-[var(--brand-primary)] transition-colors">
                        <span className="text-[13px] text-[#828282]">{currency}</span>
                        <input type="text" value={maxInput} onChange={e => setMaxInput(e.target.value)} onBlur={handleMaxBlur} onKeyDown={handleKeyDown} className="text-[13px] text-[#1d1d1d] font-medium bg-transparent outline-none w-full min-w-0" />
                    </div>
                </div>
            </div>
        </section>
    )
}

function AmenitiesFilter({ allAmenities, selected, onChange }: { allAmenities: string[]; selected: string[]; onChange: (next: string[]) => void }) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? allAmenities : allAmenities.slice(0, 4)

    const toggle = (am: string) => {
        onChange(selected.includes(am) ? selected.filter(a => a !== am) : [...selected, am])
    }

    if (allAmenities.length === 0) return null

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-4">Amenities</h4>
            <div className="flex flex-col gap-3">
                {visible.map(am => {
                    const checked = selected.includes(am)
                    return (
                        <label key={am} className="flex items-center gap-3 cursor-pointer select-none group">
                            <div className={["w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors", checked ? "bg-[var(--brand-primary)] border-2 border-[var(--brand-primary)]" : "border-2 border-[#b0b0b0] bg-white group-hover:border-[var(--brand-primary)]"].join(" ")} onClick={() => toggle(am)}>
                                {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <input type="checkbox" checked={checked} onChange={() => toggle(am)} className="sr-only" />
                            <span className="text-[14px] text-[#333333]">{am}</span>
                        </label>
                    )
                })}
            </div>
            {allAmenities.length > 4 && (
                <button onClick={() => setShowAll(s => !s)} className="flex items-center gap-1 mt-3 text-[13px] font-medium text-[#333333] hover:text-[var(--brand-primary)] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
                </button>
            )}
        </section>
    )
}

function PropertyTypeFilter({ types, selected, onChange }: { types: PropertyTypeOption[]; selected: string[]; onChange: (next: string[]) => void }) {
    const toggle = (label: string) => {
        onChange(selected.includes(label) ? selected.filter(t => t !== label) : [...selected, label])
    }

    if (types.length === 0) return null

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-4">Property Type</h4>
            <div className="grid grid-cols-2 gap-2">
                {types.map(({ value, label, icon, count }) => {
                    const active = selected.includes(value)
                    const Icon = resolveIcon(icon)
                    return (
                        <button key={value} id={`property-type-${value.toLowerCase()}`} onClick={() => toggle(value)} className={["flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left", active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-[#e0e0e0] bg-white hover:border-[var(--brand-primary)]/40"].join(" ")}>
                            <Icon size={20} className={active ? "text-[var(--brand-primary)]" : "text-[#828282]"} />
                            <span className={`text-[13px] font-medium ${active ? "text-[var(--brand-primary)]" : "text-[#333333]"}`}>{label}</span>
                            <span className="text-[11px] text-[#828282]">{count} properties</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

function GuestRatingFilter({ options, selected, onChange }: { options: RatingOption[]; selected: string | null; onChange: (next: string | null) => void }) {
    const toggle = (value: string) => onChange(selected === value ? null : value)

    if (options.length === 0) return null

    return (
        <section>
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-4">Guest Rating</h4>
            <div className="flex flex-col gap-3">
                {options.map(({ label, value }) => {
                    const active = selected === value
                    return (
                        <label key={value} className="flex items-center justify-between cursor-pointer select-none group">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--brand-secondary)] text-sm">★</span>
                                <span className="text-[14px] text-[#333333]">{label}</span>
                            </div>
                            <div onClick={() => toggle(value)} className={["w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-[#b0b0b0] bg-white group-hover:border-[var(--brand-primary)]/60"].join(" ")}>
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                        </label>
                    )
                })}
            </div>
        </section>
    )
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export default function FiltersSidebar(props: FiltersSidebarProps) {
    const { filters, onChange, onClear, sortBy, onSortChange, mapOpen, onToggleMap, filterOptions, loading } = props

    if (loading || !filterOptions) return <FilterSkeleton />

    const { propertyTypes, amenities: allAmenities, ratingOptions, priceRange, sortOptions } = filterOptions

    return (
        <aside className="w-full min-w-0">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="text-[16px] sm:text-[17px] font-bold text-[#1d1d1d]">Filters</span>
                <button onClick={onClear} className="text-[12px] sm:text-[13px] text-[var(--brand-primary)] font-medium hover:underline cursor-pointer bg-transparent border-none p-0">
                    Clear all
                </button>
            </div>

            <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[#f0f0f0]">
                <div>
                    <span className="text-[13px] font-bold text-[#828282] uppercase tracking-wider mb-2 block">Sort By</span>
                    <select value={sortBy} onChange={e => onSortChange(e.target.value)} className="w-full text-[14px] bg-white border border-[#e0e0e0] rounded-xl px-3 py-2.5 outline-none text-[#1d1d1d] font-medium cursor-pointer hover:border-[var(--brand-primary)]/40 transition-colors">
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button onClick={onToggleMap} className={["flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap border-2 w-full", mapOpen ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] hover:bg-[#6d2200]" : "bg-[#fff4eb] text-[var(--brand-primary)] border-transparent hover:border-[var(--brand-primary)]/20"].join(" ")}>
                    <Map size={18} />
                    {mapOpen ? "Hide Map" : "Show Map"}
                </button>
            </div>

            <PriceRangeFilter
                priceMin={filters.priceMin}
                priceMax={filters.priceMax}
                absMin={priceRange.min}
                absMax={priceRange.max}
                currency={priceRange.currency}
                onChange={({ priceMin, priceMax }) => onChange({ ...filters, priceMin, priceMax })}
            />
            <AmenitiesFilter allAmenities={allAmenities} selected={filters.amenities} onChange={amenities => onChange({ ...filters, amenities })} />
            <PropertyTypeFilter types={propertyTypes} selected={filters.propertyTypes} onChange={propertyTypes => onChange({ ...filters, propertyTypes })} />
            <GuestRatingFilter options={ratingOptions} selected={filters.guestRating} onChange={guestRating => onChange({ ...filters, guestRating })} />
        </aside>
    )
}
