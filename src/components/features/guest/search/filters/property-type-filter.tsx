"use client"

import { Home, Building2, BedDouble, Hotel } from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────
const PROPERTY_TYPES: { label: string; Icon: React.ElementType }[] = [
    { label: "Villa", Icon: Home },
    { label: "Apartment", Icon: Building2 },
    { label: "Guesthouse", Icon: BedDouble },
    { label: "Hotel", Icon: Hotel },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface PropertyTypeFilterProps {
    selected: string[]
    onChange: (next: string[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyTypeFilter({ selected, onChange }: PropertyTypeFilterProps) {
    const toggle = (label: string) => {
        const next = selected.includes(label)
            ? selected.filter(t => t !== label)
            : [...selected, label]
        onChange(next)
    }

    return (
        <section className="mb-7 pb-7 border-b border-[#e0e0e0]">
            <h4
                className="text-[15px] font-semibold text-[#1d1d1d] mb-4"
                style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1d" }}
            >
                Property Type
            </h4>

            <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map(({ label, Icon }) => {
                    const active = selected.includes(label)
                    return (
                        <button
                            key={label}
                            id={`property-type-${label.toLowerCase()}`}
                            onClick={() => toggle(label)}
                            className={[
                                "flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
                                active
                                    ? "border-[#953002] bg-[#953002]/5"
                                    : "border-[#e0e0e0] bg-white hover:border-[#953002]/40",
                            ].join(" ")}
                        >
                            <Icon
                                size={20}
                                className={active ? "text-[#953002]" : "text-[#828282]"}
                            />
                            <span className={`text-[13px] font-medium ${active ? "text-[#953002]" : "text-[#333333]"}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
