"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Map, Home, Building2, BedDouble, Hotel } from "lucide-react"

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
}

// ─── Filter Constants ────────────────────────────────────────────────────────
const PRICE_ABSOLUTE_MIN = 10_000
const PRICE_ABSOLUTE_MAX = 500_000
const HISTOGRAM_HEIGHTS = [18, 28, 42, 55, 60, 52, 44, 36, 48, 56, 50, 38, 30, 22]

const ALL_AMENITIES = ["Wifi", "Kitchen", "Air conditioning", "Washer", "Pool", "Parking"]
const DEFAULT_VISIBLE_AMENITIES = 4

const PROPERTY_TYPES: { label: string; Icon: React.ElementType }[] = [
    { label: "Villa", Icon: Home },
    { label: "Apartment", Icon: Building2 },
    { label: "Guesthouse", Icon: BedDouble },
    { label: "Hotel", Icon: Hotel },
]

const RATING_OPTIONS = [
    { label: "5.0 only", value: "5.0" },
    { label: "4.5 & up", value: "4.5" },
    { label: "4.0 & up", value: "4.0" },
]

function formatLKR(v: number) {
    return `LKR ${v.toLocaleString("en-US")}`
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PriceRangeFilter({ priceMin, priceMax, onChange }: { priceMin: number, priceMax: number, onChange: (next: Pick<FilterState, "priceMin" | "priceMax">) => void }) {
    const [minInput, setMinInput] = useState(priceMin.toLocaleString("en-US"))
    const [maxInput, setMaxInput] = useState(priceMax.toLocaleString("en-US"))

    useEffect(() => setMinInput(priceMin.toLocaleString("en-US")), [priceMin])
    useEffect(() => setMaxInput(priceMax.toLocaleString("en-US")), [priceMax])

    const range = PRICE_ABSOLUTE_MAX - PRICE_ABSOLUTE_MIN
    const leftPct = ((priceMin - PRICE_ABSOLUTE_MIN) / range) * 100
    const rightPct = ((priceMax - PRICE_ABSOLUTE_MIN) / range) * 100

    const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val <= priceMax) onChange({ priceMin: val, priceMax })
    }
    const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val >= priceMin) onChange({ priceMin, priceMax: val })
    }
    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinInput(e.target.value)
    const handleMinInputBlur = () => {
        let val = parseInt(minInput.replace(/\D/g, ''), 10)
        if (isNaN(val)) val = PRICE_ABSOLUTE_MIN
        val = Math.max(PRICE_ABSOLUTE_MIN, Math.min(val, priceMax))
        onChange({ priceMin: val, priceMax })
        setMinInput(val.toLocaleString("en-US"))
    }
    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxInput(e.target.value)
    const handleMaxInputBlur = () => {
        let val = parseInt(maxInput.replace(/\D/g, ''), 10)
        if (isNaN(val)) val = PRICE_ABSOLUTE_MAX
        val = Math.max(priceMin, Math.min(val, PRICE_ABSOLUTE_MAX))
        onChange({ priceMin, priceMax: val })
        setMaxInput(val.toLocaleString("en-US"))
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") e.currentTarget.blur() }

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-1">Price range</h4>
            <p className="text-[12px] text-[#828282] mb-4">Nightly prices before fees and taxes</p>
            <div className="flex items-end gap-[3px] h-[60px] mb-3">
                {HISTOGRAM_HEIGHTS.map((h, i) => {
                    const barPct = (i / (HISTOGRAM_HEIGHTS.length - 1)) * 100
                    const inRange = barPct >= leftPct && barPct <= rightPct
                    return (
                        <div key={i} className="flex-1 rounded-sm transition-colors duration-200" style={{ height: `${h}px`, backgroundColor: inRange ? "var(--brand-primary)" : "#e0e0e0" }} />
                    )
                })}
            </div>
            <div className="flex justify-between text-[11px] text-[#828282] mb-3">
                <span>{formatLKR(priceMin)}</span>
                <span>{formatLKR(priceMax)}{priceMax === PRICE_ABSOLUTE_MAX ? "+" : ""}</span>
                <span>{formatLKR(PRICE_ABSOLUTE_MAX)}</span>
            </div>
            <div className="relative h-6 flex items-center mb-4">
                <div className="absolute left-0 right-0 h-1 rounded bg-[#e0e0e0]" />
                <div className="absolute h-1 rounded bg-[var(--brand-primary)]" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
                <input type="range" min={PRICE_ABSOLUTE_MIN} max={PRICE_ABSOLUTE_MAX} step={5000} value={priceMin} onChange={handleMin} aria-label="Minimum price" className="absolute w-full h-1 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto cursor-pointer" style={{ zIndex: priceMin > PRICE_ABSOLUTE_MAX - 50_000 ? 5 : 3 }} />
                <input type="range" min={PRICE_ABSOLUTE_MIN} max={PRICE_ABSOLUTE_MAX} step={5000} value={priceMax} onChange={handleMax} aria-label="Maximum price" className="absolute w-full h-1 opacity-0 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto cursor-pointer" style={{ zIndex: 4 }} />
                <div className="absolute w-5 h-5 rounded-full bg-white border-2 border-[var(--brand-primary)] shadow-md -translate-x-1/2" style={{ left: `${leftPct}%`, zIndex: 2, pointerEvents: "none" }} >
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="absolute w-5 h-5 rounded-full bg-white border-2 border-[var(--brand-primary)] shadow-md -translate-x-1/2" style={{ left: `${rightPct}%`, zIndex: 2, pointerEvents: "none" }} />
            </div>
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Min</label>
                    <div className="flex items-center gap-1 border border-[#e0e0e0] rounded-lg px-3 py-2 bg-white focus-within:border-[var(--brand-primary)] transition-colors">
                        <span className="text-[13px] text-[#828282]">LKR</span>
                        <input type="text" value={minInput} onChange={handleMinInputChange} onBlur={handleMinInputBlur} onKeyDown={handleKeyDown} className="text-[13px] text-[#1d1d1d] font-medium bg-transparent outline-none w-full min-w-0" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Max</label>
                    <div className="flex items-center gap-1 border border-[#e0e0e0] rounded-lg px-3 py-2 bg-white focus-within:border-[var(--brand-primary)] transition-colors">
                        <span className="text-[13px] text-[#828282]">LKR</span>
                        <input type="text" value={maxInput} onChange={handleMaxInputChange} onBlur={handleMaxInputBlur} onKeyDown={handleKeyDown} className="text-[13px] text-[#1d1d1d] font-medium bg-transparent outline-none w-full min-w-0" />
                    </div>
                </div>
            </div>
        </section>
    )
}

function AmenitiesFilter({ selected, onChange }: { selected: string[], onChange: (next: string[]) => void }) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? ALL_AMENITIES : ALL_AMENITIES.slice(0, DEFAULT_VISIBLE_AMENITIES)

    const toggle = (am: string) => {
        onChange(selected.includes(am) ? selected.filter(a => a !== am) : [...selected, am])
    }

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
                            <input type="checkbox" id={`amenity-${am}`} checked={checked} onChange={() => toggle(am)} className="sr-only" />
                            <span className="text-[14px] text-[#333333]">{am}</span>
                        </label>
                    )
                })}
            </div>
            <button onClick={() => setShowAll(s => !s)} className="flex items-center gap-1 mt-3 text-[13px] font-medium text-[#333333] hover:text-[var(--brand-primary)] transition-colors bg-transparent border-none p-0 cursor-pointer">
                {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
            </button>
        </section>
    )
}

function PropertyTypeFilter({ selected, onChange }: { selected: string[], onChange: (next: string[]) => void }) {
    const toggle = (label: string) => {
        onChange(selected.includes(label) ? selected.filter(t => t !== label) : [...selected, label])
    }
    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-4">Property Type</h4>
            <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map(({ label, Icon }) => {
                    const active = selected.includes(label)
                    return (
                        <button key={label} id={`property-type-${label.toLowerCase()}`} onClick={() => toggle(label)} className={["flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left", active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-[#e0e0e0] bg-white hover:border-[var(--brand-primary)]/40"].join(" ")}>
                            <Icon size={20} className={active ? "text-[var(--brand-primary)]" : "text-[#828282]"} />
                            <span className={`text-[13px] font-medium ${active ? "text-[var(--brand-primary)]" : "text-[#333333]"}`}>{label}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

function GuestRatingFilter({ selected, onChange }: { selected: string | null, onChange: (next: string | null) => void }) {
    const toggle = (value: string) => onChange(selected === value ? null : value)
    return (
        <section>
            <h4 className="text-[15px] font-semibold text-[#1d1d1d] mb-4">Guest Rating</h4>
            <div className="flex flex-col gap-3">
                {RATING_OPTIONS.map(({ label, value }) => {
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
    const { filters, onChange, onClear, sortBy, onSortChange, mapOpen, onToggleMap } = props;
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
                        <option value="recommended">Recommended</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                    </select>
                </div>
                <button onClick={onToggleMap} className={["flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap border-2 w-full", mapOpen ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] hover:bg-[#6d2200]" : "bg-[#fff4eb] text-[var(--brand-primary)] border-transparent hover:border-[var(--brand-primary)]/20"].join(" ")}>
                    <Map size={18} />
                    {mapOpen ? "Hide Map" : "Show Map"}
                </button>
            </div>

            <PriceRangeFilter priceMin={filters.priceMin} priceMax={filters.priceMax} onChange={({ priceMin, priceMax }) => onChange({ ...filters, priceMin, priceMax })} />
            <AmenitiesFilter selected={filters.amenities} onChange={amenities => onChange({ ...filters, amenities })} />
            <PropertyTypeFilter selected={filters.propertyTypes} onChange={propertyTypes => onChange({ ...filters, propertyTypes })} />
            <GuestRatingFilter selected={filters.guestRating} onChange={guestRating => onChange({ ...filters, guestRating })} />
        </aside>
    )
}
