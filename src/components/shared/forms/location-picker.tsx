"use client"

import { MapPin } from "lucide-react"

// ─── Sri Lanka locations ──────────────────────────────────────────────────
export const SRI_LANKA_LOCATIONS = [
    "Colombo",
    "Galle",
    "Kandy",
    "Negombo",
    "Mirissa",
    "Ella",
    "Nuwara Eliya",
    "Trincomalee",
    "Arugam Bay",
    "Sigiriya",
    "Bentota",
    "Hikkaduwa",
    "Unawatuna",
    "Jaffna",
    "Polonnaruwa",
]

// ─── Props ────────────────────────────────────────────────────────────────
export interface LocationPickerProps {
    /** Current controlled value of the text input */
    value: string
    onChange: (value: string) => void
    /** Called when the user picks a suggestion */
    onSelect: (location: string) => void
    /** Whether the suggestions dropdown is visible */
    open: boolean
    /** Max number of suggestions to show */
    maxSuggestions?: number
}

// ─── Component ────────────────────────────────────────────────────────────
export default function LocationPicker({
    value,
    onChange,
    onSelect,
    open,
    maxSuggestions = 7,
}: LocationPickerProps) {
    const filtered = value.trim().length > 0
        ? SRI_LANKA_LOCATIONS.filter(l =>
            l.toLowerCase().includes(value.toLowerCase())
        )
        : SRI_LANKA_LOCATIONS

    const suggestions = filtered.slice(0, maxSuggestions)

    if (!open || suggestions.length === 0) return null

    return (
        <div
            className="absolute top-full left-0 mt-2 bg-white rounded-xl z-50 w-[220px] overflow-hidden
                 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]"
        >
            <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide px-4 pt-3 pb-1">
                Suggested
            </p>

            {suggestions.map(loc => (
                <div
                    key={loc}
                    onMouseDown={e => {
                        // Prevent the parent onBlur from firing before onSelect
                        e.preventDefault()
                        onSelect(loc)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#953002]/5 cursor-pointer transition-colors"
                >
                    <MapPin size={13} className="text-[#953002] flex-shrink-0" />
                    <span className="text-sm text-[#333333]">{loc}</span>
                </div>
            ))}
        </div>
    )
}
