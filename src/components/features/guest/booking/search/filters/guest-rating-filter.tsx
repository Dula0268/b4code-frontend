"use client"

// ─── Constants ───────────────────────────────────────────────────────────────
const RATING_OPTIONS = [
    { label: "5.0 only", value: "5.0" },
    { label: "4.5 & up", value: "4.5" },
    { label: "4.0 & up", value: "4.0" },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface GuestRatingFilterProps {
    selected: string | null
    onChange: (next: string | null) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GuestRatingFilter({ selected, onChange }: GuestRatingFilterProps) {
    const toggle = (value: string) => {
        onChange(selected === value ? null : value)
    }

    return (
        <section>
            <h4
                className="text-[15px] font-semibold text-[#1d1d1d] mb-4"
                style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1d" }}
            >
                Guest Rating
            </h4>

            <div className="flex flex-col gap-3">
                {RATING_OPTIONS.map(({ label, value }) => {
                    const active = selected === value
                    return (
                        <label
                            key={value}
                            className="flex items-center justify-between cursor-pointer select-none group"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[#ffb401] text-sm">★</span>
                                <span className="text-[14px] text-[#333333]">{label}</span>
                            </div>

                            {/* Custom radio */}
                            <div
                                onClick={() => toggle(value)}
                                className={[
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                                    active
                                        ? "border-[#953002] bg-[#953002]"
                                        : "border-[#b0b0b0] bg-white group-hover:border-[#953002]/60",
                                ].join(" ")}
                            >
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                        </label>
                    )
                })}
            </div>
        </section>
    )
}
