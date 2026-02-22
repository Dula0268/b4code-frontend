"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────
const ALL_AMENITIES = ["Wifi", "Kitchen", "Air conditioning", "Washer", "Pool", "Parking"]
const DEFAULT_VISIBLE = 4

// ─── Props ────────────────────────────────────────────────────────────────────
interface AmenitiesFilterProps {
    selected: string[]
    onChange: (next: string[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AmenitiesFilter({ selected, onChange }: AmenitiesFilterProps) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? ALL_AMENITIES : ALL_AMENITIES.slice(0, DEFAULT_VISIBLE)

    const toggle = (am: string) => {
        const next = selected.includes(am)
            ? selected.filter(a => a !== am)
            : [...selected, am]
        onChange(next)
    }

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4
                className="text-[15px] font-semibold text-[#1d1d1d] mb-4"
                style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1d" }}
            >
                Amenities
            </h4>

            <div className="flex flex-col gap-3">
                {visible.map(am => {
                    const checked = selected.includes(am)
                    return (
                        <label
                            key={am}
                            className="flex items-center gap-3 cursor-pointer select-none group"
                        >
                            {/* Custom checkbox */}
                            <div
                                className={[
                                    "w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                                    checked
                                        ? "bg-[#953002] border-2 border-[#953002]"
                                        : "border-2 border-[#b0b0b0] bg-white group-hover:border-[#953002]",
                                ].join(" ")}
                                onClick={() => toggle(am)}
                            >
                                {checked && (
                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                id={`amenity-${am}`}
                                checked={checked}
                                onChange={() => toggle(am)}
                                className="sr-only"
                            />
                            <span className="text-[14px] text-[#333333]">{am}</span>
                        </label>
                    )
                })}
            </div>

            {/* Show more / less */}
            <button
                onClick={() => setShowAll(s => !s)}
                className="flex items-center gap-1 mt-3 text-[13px] font-medium text-[#333333] hover:text-[#953002] transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
                {showAll
                    ? <><ChevronUp size={14} /> Show less</>
                    : <><ChevronDown size={14} /> Show more</>
                }
            </button>
        </section>
    )
}
