"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, Search } from "lucide-react"

import CalendarPicker from "@/components/shared/forms/calendar-picker"
import GuestPicker, { type GuestCounts } from "@/components/shared/forms/guest-picker"
import LocationPicker from "@/components/shared/forms/location-picker"

export default function SearchBar() {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────────────
  // Location
  const [destination, setDestination] = useState("")
  const [locationOpen, setLocationOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  // Dates
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [calOpen, setCalOpen] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)

  // Guests
  const [guests, setGuests] = useState<GuestCounts>({ adults: 1, children: 0 })
  const [guestOpen, setGuestOpen] = useState(false)
  const guestRef = useRef<HTMLDivElement>(null)

  // ── Close on outside click ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node))
        setLocationOpen(false)
      if (calRef.current && !calRef.current.contains(e.target as Node))
        setCalOpen(false)
      if (guestRef.current && !guestRef.current.contains(e.target as Node))
        setGuestOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Derived display labels ─────────────────────────────────────────────
  const dateLabel = (() => {
    if (checkIn && checkOut) {
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return `${fmt(checkIn)} – ${fmt(checkOut)}`
    }
    if (checkIn) {
      return `${checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ?`
    }
    return ""
  })()

  const guestTotal = guests.adults + guests.children
  const guestLabel = `${guestTotal} guest${guestTotal !== 1 ? "s" : ""}`

  // ── Search ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const params = new URLSearchParams({
      ...(destination && { destination }),
      ...(checkIn && { checkIn: checkIn.toISOString().split("T")[0] }),
      ...(checkOut && { checkOut: checkOut.toISOString().split("T")[0] }),
      guests: String(guestTotal),
    })
    router.push(`/search?${params.toString()}`)
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const closeAll = () => { setLocationOpen(false); setCalOpen(false); setGuestOpen(false) }

  return (
    <div
      role="search"
      className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-1 shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[640px]"
    >

      {/* ── Location ─────────────────────────────────────────────────── */}
      <div ref={locationRef} className="relative flex-[2]">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setLocationOpen(true) }}
        >
          <MapPin size={16} className="text-[#953002] flex-shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={e => { setDestination(e.target.value); setLocationOpen(true) }}
            onFocus={() => { closeAll(); setLocationOpen(true) }}
            placeholder="Where are you going?"
            className="border-none outline-none text-sm text-[#333333] placeholder:text-[#828282] bg-transparent w-full"
          />
        </div>

        <LocationPicker
          value={destination}
          onChange={setDestination}
          onSelect={loc => { setDestination(loc); setLocationOpen(false) }}
          open={locationOpen}
        />
      </div>

      <div className="hidden md:block w-px bg-[#e0e0e0] my-2" />

      {/* ── Dates ────────────────────────────────────────────────────── */}
      <div ref={calRef} className="relative flex-[1.5]">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setCalOpen(o => !o) }}
        >
          <Calendar size={16} className="text-[#953002] flex-shrink-0" />
          <span className={`text-sm truncate ${dateLabel ? "text-[#333333]" : "text-[#828282]"}`}>
            {dateLabel || "Dates"}
          </span>
        </div>

        {calOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl z-50
                          shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]">
            {/* Instruction header */}
            <div className="px-4 pt-3 border-b border-[#f0f0f0]">
              <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide pb-2">
                {!checkIn
                  ? "Select check-in date"
                  : !checkOut
                    ? "Select check-out date"
                    : "Date range selected"}
              </p>
            </div>

            <CalendarPicker
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co) }}
              onComplete={() => setCalOpen(false)}
            />

            {/* Clear link */}
            {(checkIn || checkOut) && (
              <div className="px-4 pb-3 flex justify-end">
                <button
                  onClick={() => { setCheckIn(null); setCheckOut(null) }}
                  className="text-xs text-[#828282] hover:text-[#333333] underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:block w-px bg-[#e0e0e0] my-2" />

      {/* ── Guests ───────────────────────────────────────────────────── */}
      <div ref={guestRef} className="relative flex-1">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setGuestOpen(o => !o) }}
        >
          <Users size={16} className="text-[#953002] flex-shrink-0" />
          <span className="text-sm text-[#333333]">{guestLabel}</span>
        </div>

        {guestOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl z-50
                          shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]">
            <GuestPicker value={guests} onChange={setGuests} />
          </div>
        )}
      </div>

      {/* ── Search button ─────────────────────────────────────────────── */}
      <button
        onClick={handleSearch}
        aria-label="Search"
        className="bg-[#953002] hover:bg-[#6d2200] text-white rounded-lg w-11 h-11 flex items-center
                   justify-center flex-shrink-0 transition-colors self-center"
      >
        <Search size={18} />
      </button>
    </div>
  )
}