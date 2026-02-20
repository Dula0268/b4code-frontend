"use client"

import { Minus, Plus } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────
export interface GuestCounts {
    adults: number
    children: number
}

export interface GuestPickerProps {
    value: GuestCounts
    onChange: (next: GuestCounts) => void
}

// ─── Row config ───────────────────────────────────────────────────────────
const ROWS: {
    key: keyof GuestCounts
    label: string
    sub: string
    min: number
}[] = [
        { key: "adults", label: "Adults", sub: "Age 13+", min: 1 },
        { key: "children", label: "Children", sub: "Ages 2–12", min: 0 },
    ]

// ─── Component ────────────────────────────────────────────────────────────
export default function GuestPicker({ value, onChange }: GuestPickerProps) {
    const total = value.adults + value.children

    const adjust = (key: keyof GuestCounts, delta: number, min: number) => {
        const next = value[key] + delta
        if (next < min) return
        onChange({ ...value, [key]: next })
    }

    return (
        <div className="p-4 w-[240px]">
            <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide mb-3">
                Guests
            </p>

            {ROWS.map(({ key, label, sub, min }) => (
                <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-0"
                >
                    {/* Label */}
                    <div>
                        <p className="text-sm font-semibold text-[#1d1d1d]">{label}</p>
                        <p className="text-xs text-[#828282]">{sub}</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => adjust(key, -1, min)}
                            disabled={value[key] <= min}
                            aria-label={`Decrease ${label}`}
                            className="w-7 h-7 rounded-full border-2 border-[#953002] flex items-center justify-center
                         text-[#953002] transition-colors
                         hover:bg-[#953002]/10
                         disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Minus size={12} />
                        </button>

                        <span className="w-4 text-center text-sm font-bold text-[#1d1d1d]">
                            {value[key]}
                        </span>

                        <button
                            onClick={() => adjust(key, 1, min)}
                            aria-label={`Increase ${label}`}
                            className="w-7 h-7 rounded-full border-2 border-[#953002] flex items-center justify-center
                         text-[#953002] transition-colors hover:bg-[#953002]/10"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Total */}
            <p className="mt-2 text-xs text-[#828282] text-center">
                {total} guest{total !== 1 ? "s" : ""} total
            </p>
        </div>
    )
}
