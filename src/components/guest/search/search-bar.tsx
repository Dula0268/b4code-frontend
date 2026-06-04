"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { MapPin, Calendar, Users, Search } from "lucide-react"

import CalendarPicker from "@/components/shared/forms/calendar-picker"
import GuestPicker, { type GuestCounts } from "@/components/shared/forms/guest-picker"
import LocationPicker from "@/components/shared/forms/location-picker"

interface SearchBarProps {
  variant?: "hero" | "compact"
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const isCompact = variant === "compact"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ── Seed initial values from URL params (compact / results page) ────────
  const initDestination = isCompact ? (searchParams.get("destination") ?? "") : ""
  const initCheckIn = isCompact && searchParams.get("checkIn")
    ? new Date(searchParams.get("checkIn")! + "T00:00:00")
    : null
  const initCheckOut = isCompact && searchParams.get("checkOut")
    ? new Date(searchParams.get("checkOut")! + "T00:00:00")
    : null
  const initGuests = isCompact ? Number(searchParams.get("guests") ?? 1) : 1
  const initRooms = isCompact ? Number(searchParams.get("rooms") ?? 1) : 1

  // ── State ──────────────────────────────────────────────────────────────
  // Location
  const [destination, setDestination] = useState(initDestination)
  const [locationOpen, setLocationOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  // Dates
  const [checkIn, setCheckIn] = useState<Date | null>(initCheckIn)
  const [checkOut, setCheckOut] = useState<Date | null>(initCheckOut)
  const [calOpen, setCalOpen] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)

  // Guests
  const [guests, setGuests] = useState<GuestCounts>({ adults: Math.max(1, initGuests), children: 0, rooms: Math.max(1, initRooms) })
  const [guestOpen, setGuestOpen] = useState(false)
  const guestRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Keep the compact search bar aligned with the current URL when navigating
  // between guest search results.
  useEffect(() => {
    if (!isCompact) return

    const nextDestination = searchParams.get("destination") ?? ""
    const nextCheckIn = searchParams.get("checkIn")
      ? new Date(searchParams.get("checkIn")! + "T00:00:00")
      : null
    const nextCheckOut = searchParams.get("checkOut")
      ? new Date(searchParams.get("checkOut")! + "T00:00:00")
      : null
    const nextGuests = Math.max(1, Number(searchParams.get("guests") ?? 1))
    const nextRooms = Math.max(1, Number(searchParams.get("rooms") ?? 1))

    setDestination(nextDestination)
    setCheckIn(nextCheckIn)
    setCheckOut(nextCheckOut)
    setGuests(prev => {
      if (prev.adults + prev.children === nextGuests && prev.rooms === nextRooms) return prev;
      return { adults: nextGuests, children: 0, rooms: nextRooms };
    })
  }, [isCompact, searchParams])

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
    if (!mounted) return ""
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
  const guestLabel = !mounted 
    ? "1 guest · 1 room" 
    : `${guestTotal} guest${guestTotal !== 1 ? "s" : ""} · ${guests.rooms} room${guests.rooms !== 1 ? "s" : ""}`

  // Keep search results in sync when guest count changes on compact search bar.
  useEffect(() => {
    if (!isCompact || !pathname.startsWith("/guest/search")) return
    const currentGuests = Number(searchParams.get("guests") ?? 1)
    const currentRooms = Number(searchParams.get("rooms") ?? 1)
    if (currentGuests === guestTotal && currentRooms === guests.rooms) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("guests", String(Math.max(1, guestTotal)))
    params.set("rooms", String(Math.max(1, guests.rooms)))
    router.replace(`/guest/search?${params.toString()}`)
  }, [guestTotal, guests.rooms, isCompact, pathname, router, searchParams])

  // ── Search ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      alert("Check-out date must be after check-in date")
      return
    }

    const params = new URLSearchParams()
    if (destination.trim()) params.set("destination", destination.trim())
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0])
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0])
    params.set("guests", String(Math.max(1, guestTotal)))
    params.set("rooms", String(Math.max(1, guests.rooms)))
    const url = `/guest/search?${params.toString()}`
    // Replace history entry when already on search page to avoid stacking
    if (pathname.startsWith("/guest/search")) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const closeAll = () => { setLocationOpen(false); setCalOpen(false); setGuestOpen(false) }

  return (
    <div
      role="search"
      className={[
        "bg-white flex flex-col md:flex-row gap-0 md:rounded-full rounded-2xl items-center",
        isCompact
          ? "p-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1),0_10px_20px_-2px_rgba(0,0,0,0.04)] w-full max-w-[700px] border border-gray-200"
          : "p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-[800px]",
      ].join(" ")}
      suppressHydrationWarning
    >

      {/* ── Location ─────────────────────────────────────────────────── */}
      <div ref={locationRef} className="relative flex-[2] w-full">
        <div
          className="flex items-center gap-3 px-6 py-3 md:rounded-full rounded-xl hover:bg-gray-100 transition-colors cursor-pointer w-full"
          onClick={() => { closeAll(); setLocationOpen(true) }}
        >
          <MapPin size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={e => { setDestination(e.target.value); setLocationOpen(true) }}
            onFocus={() => { closeAll(); setLocationOpen(true) }}
            placeholder="Search destination"
            className="border-none focus:ring-0 focus:border-none focus:outline-none outline-none text-base font-medium text-[#333333] placeholder:text-[#828282] bg-transparent w-full p-0"
            suppressHydrationWarning
          />
        </div>

        <LocationPicker
          value={destination}
          onChange={setDestination}
          onSelect={loc => { setDestination(loc); setLocationOpen(false) }}
          open={locationOpen}
        />
      </div>

      <div className="hidden md:block w-px h-8 bg-gray-300 mx-2" />

      {/* ── Dates ────────────────────────────────────────────────────── */}
      <div ref={calRef} className="relative flex-[1.5] w-full">
        <div
          className="flex items-center gap-3 px-6 py-3 md:rounded-full rounded-xl hover:bg-gray-100 transition-colors cursor-pointer w-full"
          onClick={() => { closeAll(); setCalOpen(o => !o) }}
        >
          <Calendar size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
          <span className={`text-sm font-medium truncate ${dateLabel ? "text-[#333333]" : "text-[#828282]"}`}>
            {dateLabel || "Add dates"}
          </span>
        </div>

        {calOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl z-50
                          shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]">

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

      <div className="hidden md:block w-px h-8 bg-gray-300 mx-2" />

      {/* ── Guests ───────────────────────────────────────────────────── */}
      <div ref={guestRef} className="relative flex-1 w-full flex items-center justify-between">
        <div
          className="flex items-center gap-3 px-6 py-3 md:rounded-full rounded-xl hover:bg-gray-100 transition-colors cursor-pointer w-full"
          onClick={() => { closeAll(); setGuestOpen(o => !o) }}
        >
          <Users size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
          <span className="text-sm font-medium text-[#333333] whitespace-nowrap">{guestLabel}</span>
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
        className="bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white rounded-full md:w-12 md:h-12 w-full h-12 flex items-center justify-center transition-all duration-300 active:scale-95 group shadow-md hover:shadow-lg flex-shrink-0 md:mr-1 md:mt-0 mt-2"
        suppressHydrationWarning
      >
        <Search size={20} />
      </button>
    </div>
  )
}