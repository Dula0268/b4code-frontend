"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

// ─── Helpers ──────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay()
    return (day + 6) % 7 // Make Monday = 0
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
    const [flexDates, setFlexDates] = useState<number>(0)

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
    const handleDay = (day: number, month: number, year: number) => {
        const clicked = new Date(year, month, day)

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

    // The effective end of the range (either confirmed checkOut or hovered preview)
    const rangeEnd = checkIn && !checkOut && hovered && hovered > checkIn
        ? hovered
        : checkOut

    const renderMonth = (year: number, month: number, isLeft: boolean) => {
        const totalDays = getDaysInMonth(year, month)
        const startDay = getFirstDayOfMonth(year, month)
        const cells: (number | null)[] = [
            ...Array(startDay).fill(null),
            ...Array.from({ length: totalDays }, (_, i) => i + 1),
        ]

        // Check if previous month button should be disabled
        const isPrevDisabled = isLeft && (year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth()))

        return (
            <div className="flex-1 w-[320px]">
                {/* ── Month header ── */}
                <div className="flex items-center justify-between mb-6">
                    {isLeft ? (
                        <button
                            onClick={prevMonth}
                            disabled={isPrevDisabled}
                            aria-label="Previous month"
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isPrevDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-black"}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    ) : <div className="w-8 h-8" />}

                    <span className="font-bold text-black text-[15px]">
                        {MONTH_NAMES[month]} {year}
                    </span>

                    {!isLeft ? (
                        <button
                            onClick={nextMonth}
                            aria-label="Next month"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-black transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    ) : <div className="w-8 h-8" />}
                </div>

                {/* ── Day-of-week labels ── */}
                <div className="grid grid-cols-7 mb-2">
                    {DAY_LABELS.map((d, i) => (
                        <div
                            key={i}
                            className="text-center text-[13px] font-medium text-[#828282] py-1"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* ── Date cells ── */}
                <div className="grid grid-cols-7 gap-y-1">
                    {cells.map((day, i) => {
                        if (!day) return <div key={i} className="h-11" />

                        const date = new Date(year, month, day)
                        const isPast = date < todayMidnight
                        const isCheckIn = checkIn ? isSameDay(date, checkIn) : false
                        const isCheckOut = rangeEnd ? isSameDay(date, rangeEnd) : false
                        const inRange = checkIn && rangeEnd
                            ? isBetween(date, checkIn, rangeEnd)
                            : false

                        let wrapClass = "relative flex items-center justify-center h-11 w-11 mx-auto "
                        let innerClass = "w-full h-full flex items-center justify-center rounded-md z-10 relative text-[14px] transition-colors "

                        if (isPast) {
                            wrapClass += "cursor-not-allowed"
                            innerClass += "text-[#cccccc]"
                        } else if (isCheckIn || isCheckOut) {
                            wrapClass += "cursor-pointer"
                            innerClass += "bg-[var(--brand-primary)] text-white font-bold"
                        } else if (inRange) {
                            wrapClass += "bg-[var(--brand-primary)]/10 cursor-pointer"
                            innerClass += "text-[var(--brand-primary)] font-medium"
                        } else {
                            wrapClass += "cursor-pointer"
                            innerClass += "text-[#333333] font-medium hover:border hover:border-gray-800"
                        }

                        // Connecting bars for the range highlight
                        const showLeftBar = inRange || (isCheckOut && checkIn && rangeEnd && rangeEnd > checkIn)
                        const showRightBar = inRange || (isCheckIn && checkIn && rangeEnd && rangeEnd > checkIn)

                        return (
                            <div
                                key={i}
                                className={wrapClass}
                                onMouseEnter={() => !isPast && setHovered(date)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => !isPast && handleDay(day, month, year)}
                            >
                                {showLeftBar && (
                                    <div className="absolute left-[-2px] top-0 w-[55%] h-full bg-[var(--brand-primary)]/10 z-0" />
                                )}
                                {showRightBar && (
                                    <div className="absolute right-[-2px] top-0 w-[55%] h-full bg-[var(--brand-primary)]/10 z-0" />
                                )}
                                <div className={innerClass}>{day}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const nextMonthVal = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYearVal = viewMonth === 11 ? viewYear + 1 : viewYear

    return (
        <div className="p-6 w-[700px] bg-white rounded-3xl">
            <div className="flex gap-8">
                {renderMonth(viewYear, viewMonth, true)}
                {renderMonth(nextYearVal, nextMonthVal, false)}
            </div>

        </div>
    )
}
