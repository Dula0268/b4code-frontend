"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Map, Home, Building2, BedDouble, Hotel, Palmtree, TreePine, ShieldCheck, Coffee, Dog, Accessibility, X } from "lucide-react"
import type { FilterOptionsResponse, PropertyTypeOption, RatingOption, SortOption } from "@/api/guest/search.api"

// ─── Types ───────────────────────────────────────────────────────────────────
export interface FilterState {
    priceMin: number
    priceMax: number
    advancedFilters: string[]
    propertyTypes: string[]
    guestRating: string | null
}

interface FiltersSidebarProps {
    filters: FilterState
    onChange: (next: FilterState) => void
    onClear: () => void
    filterOptions: FilterOptionsResponse | null
    loading?: boolean
    isMobileOpen?: boolean
    onCloseMobile?: () => void
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
        <section className="mb-4 pb-4 border-b border-[#e0e0e0]">
            <h4 className="text-[17px] font-bold text-[#1d1d1d] mb-1">Price range</h4>
            <p className="text-[13px] text-[#828282] mb-4">Nightly prices before fees and taxes</p>
            <div className="text-[15px] font-semibold text-[#1d1d1d] mb-4 px-1">
                {currency} {priceMin.toLocaleString("en-US")} - {currency} {priceMax.toLocaleString("en-US")}
            </div>
            
            <div className="relative h-8 flex items-center mb-4 px-3">
                <div className="absolute left-3 right-3 h-[3px] rounded-full bg-[#e0e0e0]" />
                <div className="absolute h-[3px] rounded-full bg-[var(--brand-primary)]" style={{ left: `calc(12px + (100% - 24px) * ${leftPct / 100})`, right: `calc(12px + (100% - 24px) * ${(100 - rightPct) / 100})` }} />
                
                <input type="range" min={absMin} max={absMax} step={100} value={priceMin} onChange={handleMin} aria-label="Minimum price" className="absolute left-3 right-3 w-[calc(100%-24px)] h-8 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:appearance-none" style={{ zIndex: priceMin > absMax - (absMax - absMin)/2 ? 5 : 3 }} />
                <input type="range" min={absMin} max={absMax} step={100} value={priceMax} onChange={handleMax} aria-label="Maximum price" className="absolute left-3 right-3 w-[calc(100%-24px)] h-8 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:appearance-none" style={{ zIndex: 4 }} />
                
                <div className="absolute w-6 h-6 rounded-full bg-[var(--brand-primary)] shadow-md flex items-center justify-center -translate-x-1/2 ring-[6px] ring-[var(--brand-primary)]/20" style={{ left: `calc(12px + (100% - 24px) * ${leftPct / 100})`, zIndex: 2, pointerEvents: "none" }} />
                <div className="absolute w-6 h-6 rounded-full bg-[var(--brand-primary)] shadow-md flex items-center justify-center -translate-x-1/2 ring-[6px] ring-[var(--brand-primary)]/20" style={{ left: `calc(12px + (100% - 24px) * ${rightPct / 100})`, zIndex: 2, pointerEvents: "none" }} />
            </div>
        </section>
    )
}

const ADVANCED_ICONS: Record<string, React.ElementType> = {
    "Free Cancellation": ShieldCheck,
    "Breakfast": Coffee,
    "Pet-Friendly": Dog,
    "Accessibility": Accessibility
}

function AdvancedFilters({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
    const filters = ["Free Cancellation", "Breakfast", "Pet-Friendly", "Accessibility"]

    const toggle = (am: string) => {
        onChange(selected.includes(am) ? selected.filter(a => a !== am) : [...selected, am])
    }

    return (
        <section className="mb-4 pb-4 border-b border-[#e0e0e0]">
            <h4 className="text-[17px] font-bold text-[#1d1d1d] mb-3">Advanced Filters</h4>
            <div className="flex flex-col gap-1.5">
                {filters.map(am => {
                    const checked = selected.includes(am)
                    const Icon = ADVANCED_ICONS[am] || ShieldCheck;
                    return (
                        <div 
                            key={am} 
                            onClick={() => toggle(am)} 
                            className={["flex items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-pointer select-none group", 
                                checked ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-transparent bg-white hover:bg-[#f8f8f8]"
                            ].join(" ")}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} className={checked ? "text-[var(--brand-primary)]" : "text-[#828282] transition-colors"} />
                                <span className={`text-[15px] font-medium transition-colors ${checked ? "text-[#1d1d1d]" : "text-[#4a4a4a]"}`}>{am}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

function PropertyTypeFilter({ types, selected, onChange }: { types: PropertyTypeOption[]; selected: string[]; onChange: (next: string[]) => void }) {
    const toggle = (label: string) => {
        onChange(selected.includes(label) ? selected.filter(t => t !== label) : [...selected, label])
    }

    if (types.length === 0) return null

    return (
        <section className="mb-4 pb-4 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-3">Property Type</h4>
            <div className="grid grid-cols-2 gap-2">
                {types.map(({ value, label, icon, count }) => {
                    const active = selected.includes(value)
                    const Icon = resolveIcon(icon)
                    return (
                        <button key={value} id={`property-type-${value.toLowerCase()}`} onClick={() => toggle(value)} className={["flex flex-col items-start gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left", active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-[#e0e0e0] bg-white hover:border-[var(--brand-primary)]/40"].join(" ")}>
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

function GuestRatingFilter({ selected, onChange }: { selected: string | null; onChange: (next: string | null) => void }) {
    return (
        <section className="mb-4 pb-4 border-b border-[#e0e0e0]">
            <h4 className="text-[17px] font-bold text-[#1d1d1d] mb-3">Guest Rating</h4>
            <div className="flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const value = String(rating);
                    const active = selected === value;
                    return (
                        <div 
                            key={value}
                            onClick={() => onChange(active ? null : value)} 
                            className={["flex items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-pointer select-none group", 
                                active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-transparent bg-white hover:bg-[#f8f8f8]"
                            ].join(" ")}
                        >
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-[19px] leading-none ${i < rating ? "text-[#f59e0b]" : "text-[#f59e0b]/40"}`}>
                                        {i < rating ? "★" : "☆"}
                                    </span>
                                ))}
                                <span className={`text-[14px] ml-2 font-semibold transition-colors ${active ? "text-[#1d1d1d]" : "text-[#828282]"}`}>& Up</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export default function FiltersSidebar(props: FiltersSidebarProps) {
    const { filters, onChange, onClear, filterOptions, loading, isMobileOpen, onCloseMobile } = props

    if (loading || !filterOptions) return <FilterSkeleton />

    const { propertyTypes, priceRange } = filterOptions

    const sidebarContent = (
        <div className="p-4 sm:p-5 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#f0f0f0]">
                <span className="text-[18px] sm:text-[19px] font-bold text-[#1d1d1d]">Filters</span>
                {onCloseMobile && (
                    <button onClick={onCloseMobile} className="md:hidden p-2 -mr-2 text-[#1d1d1d] hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

                <PriceRangeFilter
                    priceMin={filters.priceMin}
                    priceMax={filters.priceMax}
                    absMin={priceRange.min}
                    absMax={priceRange.max}
                    currency={priceRange.currency}
                    onChange={({ priceMin, priceMax }) => onChange({ ...filters, priceMin, priceMax })}
                />
                
                <PropertyTypeFilter types={propertyTypes} selected={filters.propertyTypes} onChange={propertyTypes => onChange({ ...filters, propertyTypes })} />
                <GuestRatingFilter selected={filters.guestRating} onChange={guestRating => onChange({ ...filters, guestRating })} />
                <AdvancedFilters selected={filters.advancedFilters} onChange={advancedFilters => onChange({ ...filters, advancedFilters })} />
                
                <div className="mt-2 pt-2">
                    <button onClick={onClear} className="w-full py-3 bg-[#fff4eb] text-[var(--brand-primary)] text-[14px] font-bold rounded-xl hover:bg-[#ffe4d6] transition-colors cursor-pointer border border-[#ffe4d6]">
                        Clear all filters
                    </button>
                </div>
            </div>
    )

    return (
        <>
            {/* Desktop View */}
            <aside className="hidden md:block w-full min-w-0 bg-white border border-[#e0e0e0] rounded-2xl shadow-sm overflow-hidden">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-black/40 flex" onClick={onCloseMobile}>
                    {/* Drawer Content */}
                    <aside 
                        className="w-[85%] max-w-[360px] h-full bg-white shadow-xl animate-slide-in-right flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    )
}
