"use client"

import { Minus, Plus } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────
export interface GuestCounts {
    adults: number
    rooms: number
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
        { key: "rooms", label: "Rooms", sub: "Bedrooms needed", min: 1 },
        { key: "adults", label: "Adults", sub: "Age 13+", min: 1 },
    ]

// ─── Component ────────────────────────────────────────────────────────────
export default function GuestPicker({ value, onChange }: GuestPickerProps) {
    const total = value.adults

    const adjust = (key: keyof GuestCounts, delta: number, min: number) => {
        const next = value[key] + delta
        if (next < min) return
        onChange({ ...value, [key]: next })
    }

    return (
        <div className="p-5 w-[280px]">


            {ROWS.map(({ key, label, sub, min }) => (
                <div
                    key={key}
                    className="flex items-center justify-between py-4 border-b border-[#f0f0f0] last:border-0"
                >
                    {/* Label */}
                    <div>
                        <p className="text-[16px] font-bold text-[#1d1d1d] leading-tight">{label}</p>
                        <p className="text-[13px] text-[#828282] mt-0.5">{sub}</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => adjust(key, -1, min)}
                            disabled={value[key] <= min}
                            aria-label={`Decrease ${label}`}
                            className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors
                                       border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10
                                       disabled:border-[var(--brand-primary)]/30 disabled:text-[var(--brand-primary)]/40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            <Minus size={16} strokeWidth={2} />
                        </button>

                        <span className="w-5 text-center text-[16px] font-bold text-[#1d1d1d]">
                            {value[key]}
                        </span>

                        <button
                            onClick={() => adjust(key, 1, min)}
                            aria-label={`Increase ${label}`}
                            className="w-9 h-9 rounded-full border-[2px] flex items-center justify-center transition-colors
                                       border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            ))}


        </div>
    )
}
