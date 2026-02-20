"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

// ─── Helpers ──────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function isBetween(d: Date, start: Date, end: Date) {
    return d > start && d < end
}

// ─── Props ────────────────────────────────────────────────────────────────
export interface CalendarPickerProps {
    checkIn: Date | null
    checkOut: Date | null
    onChange: (checkIn: Date | null, checkOut: Date | null) => void
    /** Called after the user picks a check-out date so the parent can close the dropdown */
    onComplete?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CalendarPicker({
    checkIn,
    checkOut,
    onChange,
    onComplete,
}: CalendarPickerProps) {
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())
    const [hovered, setHovered] = useState<Date | null>(null)

    // ── Navigation ──────────────────────────────────────────────────────────
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    // ── Day click ───────────────────────────────────────────────────────────
    const handleDay = (day: number) => {
        const clicked = new Date(viewYear, viewMonth, day)

        if (!checkIn || (checkIn && checkOut)) {
            // Start fresh selection
            onChange(clicked, null)
        } else {
            if (clicked <= checkIn) {
                // Clicked before existing check-in → restart
                onChange(clicked, null)
            } else {
                // Valid check-out picked
                onChange(checkIn, clicked)
                onComplete?.()
            }
        }
    }

    // ── Build grid ──────────────────────────────────────────────────────────
    const totalDays = getDaysInMonth(viewYear, viewMonth)
    const startDay = getFirstDayOfMonth(viewYear, viewMonth)
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ]

    // The effective end of the range (either confirmed checkOut or hovered preview)
    const rangeEnd = checkIn && !checkOut && hovered && hovered > checkIn
        ? hovered
        : checkOut

    return (
        <div className="p-4 w-[300px]">

            {/* ── Month header ── */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#953002]/10 text-[#953002] transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                <span className="font-bold text-[#953002] text-[15px]">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>

                <button
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#953002]/10 text-[#953002] transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* ── Day-of-week labels ── */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map((d, i) => (
                    <div
                        key={i}
                        className="text-center text-xs font-semibold text-[#828282] py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Date cells ── */}
            <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} />

                    const date = new Date(viewYear, viewMonth, day)
                    const isPast = date < todayMidnight
                    const isCheckIn = checkIn ? isSameDay(date, checkIn) : false
                    const isCheckOut = rangeEnd ? isSameDay(date, rangeEnd) : false
                    const inRange = checkIn && rangeEnd
                        ? isBetween(date, checkIn, rangeEnd)
                        : false

                    let wrapClass = "relative flex items-center justify-center h-9 "
                    let innerClass = "w-8 h-8 flex items-center justify-center rounded-full z-10 relative text-sm "

                    if (isPast) {
                        wrapClass += "cursor-not-allowed"
                        innerClass += "text-[#cccccc]"
                    } else if (isCheckIn || isCheckOut) {
                        wrapClass += "cursor-pointer"
                        innerClass += "bg-[#953002] text-white font-bold"
                    } else if (inRange) {
                        wrapClass += "bg-[#953002]/10 cursor-pointer"
                        innerClass += "text-[#953002] font-medium"
                    } else {
                        wrapClass += "cursor-pointer"
                        innerClass += "text-[#333333] font-medium hover:bg-[#953002]/10 hover:text-[#953002]"
                    }

                    // Connecting bars for the range highlight
                    const showLeftBar = inRange || isCheckOut
                    const showRightBar = inRange || isCheckIn

                    return (
                        <div
                            key={i}
                            className={wrapClass}
                            onMouseEnter={() => !isPast && setHovered(date)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => !isPast && handleDay(day)}
                        >
                            {showLeftBar && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-9 bg-[#953002]/10 z-0" />
                            )}
                            {showRightBar && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-9 bg-[#953002]/10 z-0" />
                            )}
                            <div className={innerClass}>{day}</div>
                        </div>
                    )
                })}
            </div>

            {/* ── Status footer ── */}
            <div className="mt-3 flex items-center justify-between text-xs text-[#828282] border-t border-[#f0f0f0] pt-3">
                <span>
                    {checkIn
                        ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Select check-in"}
                </span>
                <span className="text-[#953002]">→</span>
                <span>
                    {checkOut
                        ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Select check-out"}
                </span>
            </div>
        </div>
    )
}
