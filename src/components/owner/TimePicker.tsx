"use client";

import { ChevronDown, Clock } from "lucide-react";

export interface TimeValue {
    hour: string;
    minute: string;
    period: "AM" | "PM";
}

/** Parse a "HH:MM AM/PM" string into a TimeValue */
export function parseTime(str: string): TimeValue {
    const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
        return {
            hour: String(parseInt(match[1], 10)),
            minute: match[2],
            period: match[3].toUpperCase() as "AM" | "PM",
        };
    }
    return { hour: "12", minute: "00", period: "PM" };
}

/** Format a TimeValue back to "HH:MM AM/PM" */
export function formatTime(v: TimeValue): string {
    return `${v.hour.padStart(2, "0")}:${v.minute} ${v.period}`;
}

interface Props {
    value: TimeValue;
    onChange: (v: TimeValue) => void;
    className?: string;
}

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];

const selStyle =
    "appearance-none bg-transparent outline-none text-[13px] text-[#1d1d1d] font-medium cursor-pointer pr-1";

export default function TimePicker({ value, onChange, className = "" }: Props) {
    return (
        <div className={`flex items-center gap-1 border border-[#e0e0e0] rounded-lg px-3 py-2 bg-white w-full ${className}`}>
            {/* Hour */}
            <div className="relative flex items-center">
                <select
                    value={value.hour}
                    onChange={(e) => onChange({ ...value, hour: e.target.value })}
                    className={selStyle}
                >
                    {HOURS.map((h) => (
                        <option key={h} value={h}>{h.padStart(2, "0")}</option>
                    ))}
                </select>
                <ChevronDown size={11} color="#b0b0b0" className="pointer-events-none -ml-1" />
            </div>

            <span className="text-[#b0b0b0] text-[13px] font-bold select-none">:</span>

            {/* Minute */}
            <div className="relative flex items-center">
                <select
                    value={value.minute}
                    onChange={(e) => onChange({ ...value, minute: e.target.value })}
                    className={selStyle}
                >
                    {MINUTES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <ChevronDown size={11} color="#b0b0b0" className="pointer-events-none -ml-1" />
            </div>

            <span className="flex-1" />

            {/* AM / PM toggle */}
            <div className="flex rounded-md overflow-hidden border border-[#e0e0e0] text-[11px] font-bold shrink-0">
                {(["AM", "PM"] as const).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange({ ...value, period: p })}
                        className={`px-2 py-0.5 border-none cursor-pointer transition-colors ${
                            value.period === p
                                ? "bg-[#953002] text-white"
                                : "bg-white text-[#828282] hover:bg-[#f5f5f5]"
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <Clock size={14} color="#b0b0b0" className="ml-2 shrink-0" />
        </div>
    );
}
