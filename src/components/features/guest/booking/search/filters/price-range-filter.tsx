"use client"

import type { FilterState } from "./filter-types"

// ─── Constants ───────────────────────────────────────────────────────────────
const PRICE_ABSOLUTE_MIN = 10_000
const PRICE_ABSOLUTE_MAX = 500_000
const HISTOGRAM_HEIGHTS = [18, 28, 42, 55, 60, 52, 44, 36, 48, 56, 50, 38, 30, 22]

function formatLKR(v: number) {
    return `LKR ${v.toLocaleString("en-US")}`
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PriceRangeFilterProps {
    priceMin: FilterState["priceMin"]
    priceMax: FilterState["priceMax"]
    onChange: (next: Pick<FilterState, "priceMin" | "priceMax">) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PriceRangeFilter({ priceMin, priceMax, onChange }: PriceRangeFilterProps) {
    const range = PRICE_ABSOLUTE_MAX - PRICE_ABSOLUTE_MIN
    const leftPct = ((priceMin - PRICE_ABSOLUTE_MIN) / range) * 100
    const rightPct = ((priceMax - PRICE_ABSOLUTE_MIN) / range) * 100

    const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val < priceMax - 10_000) onChange({ priceMin: val, priceMax })
    }
    const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        if (val > priceMin + 10_000) onChange({ priceMin, priceMax: val })
    }

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4
                className="text-[15px] font-semibold text-[#1d1d1d] mb-1"
                style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1d" }}
            >
                Price range
            </h4>
            <p className="text-[12px] text-[#828282] mb-4">Nightly prices before fees and taxes</p>

            {/* Histogram */}
            <div className="flex items-end gap-[3px] h-[60px] mb-3">
                {HISTOGRAM_HEIGHTS.map((h, i) => {
                    const barPct = (i / (HISTOGRAM_HEIGHTS.length - 1)) * 100
                    const inRange = barPct >= leftPct && barPct <= rightPct
                    return (
                        <div
                            key={i}
                            className="flex-1 rounded-sm transition-colors duration-200"
                            style={{ height: `${h}px`, backgroundColor: inRange ? "#953002" : "#e0e0e0" }}
                        />
                    )
                })}
            </div>

            {/* Range labels */}
            <div className="flex justify-between text-[11px] text-[#828282] mb-3">
                <span>{formatLKR(priceMin)}</span>
                <span>{formatLKR(priceMax)}{priceMax === PRICE_ABSOLUTE_MAX ? "+" : ""}</span>
                <span>{formatLKR(PRICE_ABSOLUTE_MAX)}</span>
            </div>

            {/* Dual-thumb slider */}
            <div className="relative h-6 flex items-center mb-4">
                {/* Track bg */}
                <div className="absolute left-0 right-0 h-1 rounded bg-[#e0e0e0]" />
                {/* Active track */}
                <div
                    className="absolute h-1 rounded bg-[#953002]"
                    style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
                />
                {/* Min input */}
                <input
                    type="range"
                    min={PRICE_ABSOLUTE_MIN}
                    max={PRICE_ABSOLUTE_MAX}
                    step={5000}
                    value={priceMin}
                    onChange={handleMin}
                    aria-label="Minimum price"
                    className="absolute w-full h-1 opacity-0 cursor-pointer"
                    style={{ zIndex: priceMin > PRICE_ABSOLUTE_MAX - 50_000 ? 5 : 3 }}
                />
                {/* Max input */}
                <input
                    type="range"
                    min={PRICE_ABSOLUTE_MIN}
                    max={PRICE_ABSOLUTE_MAX}
                    step={5000}
                    value={priceMax}
                    onChange={handleMax}
                    aria-label="Maximum price"
                    className="absolute w-full h-1 opacity-0 cursor-pointer"
                    style={{ zIndex: 4 }}
                />
                {/* Visual thumb – min */}
                <div
                    className="absolute w-5 h-5 rounded-full bg-white border-2 border-[#953002] shadow-md -translate-x-1/2"
                    style={{ left: `${leftPct}%`, zIndex: 2, pointerEvents: "none" }}
                >
                    <div className="w-2 h-2 rounded-full bg-[#953002] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                {/* Visual thumb – max */}
                <div
                    className="absolute w-5 h-5 rounded-full bg-white border-2 border-[#953002] shadow-md -translate-x-1/2"
                    style={{ left: `${rightPct}%`, zIndex: 2, pointerEvents: "none" }}
                />
            </div>

            {/* Min / Max display boxes */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Min</label>
                    <div className="border border-[#e0e0e0] rounded-lg px-3 py-2 text-[13px] text-[#1d1d1d] font-medium bg-white">
                        LKR {priceMin.toLocaleString("en-US")}
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-medium text-[#828282] uppercase tracking-wide mb-1">Max</label>
                    <div className="border border-[#e0e0e0] rounded-lg px-3 py-2 text-[13px] text-[#1d1d1d] font-medium bg-white">
                        LKR {priceMax.toLocaleString("en-US")}
                    </div>
                </div>
            </div>
        </section>
    )
}
