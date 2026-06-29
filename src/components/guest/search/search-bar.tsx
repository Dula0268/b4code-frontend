"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { MapPin, Calendar, Users, Search } from "lucide-react"
import { toast } from "sonner"

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
  const [guests, setGuests] = useState<GuestCounts>({ adults: Math.max(1, initGuests), rooms: Math.max(1, initRooms) })
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
    setGuests({ adults: nextGuests, rooms: nextRooms })
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

  const guestTotal = guests.adults
  const guestLabel = !mounted ? "1 guest . 1 room" : `${guestTotal} guest${guestTotal !== 1 ? "s" : ""} . ${guests.rooms} room${guests.rooms !== 1 ? "s" : ""}`

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
  }, [guestTotal, isCompact, pathname, router, searchParams])

  // ── Search ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!destination.trim() || !checkIn || !checkOut) {
      toast.error("Please enter a destination and select your check-in and check-out dates.")
      return
    }

    if (guests.adults < 1 || guests.rooms < 1) {
      toast.error("Please select at least 1 guest and 1 room.")
      return
    }

    if (checkIn && checkOut && checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date.")
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
    <div className="relative">
      <div
        role="search"
        className={[
          "bg-white flex flex-col md:flex-row border-[3px] border-[var(--brand-secondary)]",
        isCompact
          ? "shadow-sm w-full max-w-[680px]"
          : "shadow-2xl w-full max-w-[850px]",
      ].join(" ")}
      suppressHydrationWarning
    >

      {/* ── Location ─────────────────────────────────────────────────── */}
      <div ref={locationRef} className="relative flex-[2]">
        <div
          className="flex items-center gap-2 px-4 h-[58px] hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setLocationOpen(true) }}
        >
          <MapPin size={22} strokeWidth={2} className="text-[var(--brand-primary)] flex-shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={e => { setDestination(e.target.value); setLocationOpen(true) }}
            onFocus={() => { closeAll(); setLocationOpen(true) }}
            placeholder="Where are you going?"
            className="border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-base font-medium text-[#333333] placeholder:text-[#828282] bg-transparent w-full"
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

      <div className="hidden md:block w-[3px] bg-[var(--brand-secondary)] flex-shrink-0" />

      {/* ── Dates ────────────────────────────────────────────────────── */}
      <div ref={calRef} className="relative flex-[1.5]">
        <div
          className="flex items-center gap-2 px-4 h-[58px] hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setCalOpen(o => !o) }}
        >
          <Calendar size={22} strokeWidth={2} className="text-[var(--brand-primary)] flex-shrink-0" />
          <span className={`text-base font-medium truncate ${dateLabel ? "text-[#333333]" : "text-[#828282]"}`}>
            {dateLabel || "Check-in date — Check-out date"}
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

            {/* Clear button */}
            {(checkIn || checkOut) && (
              <div className="px-6 pb-5 flex justify-end">
                <button
                  onClick={() => { setCheckIn(null); setCheckOut(null) }}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-[13px] font-medium rounded-lg text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:block w-[3px] bg-[var(--brand-secondary)] flex-shrink-0" />

      {/* ── Guests ───────────────────────────────────────────────────── */}
      <div ref={guestRef} className="relative flex-1">
        <div
          className="flex items-center gap-2 px-4 h-[58px] hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => { closeAll(); setGuestOpen(o => !o) }}
        >
          <Users size={22} strokeWidth={2} className="text-[var(--brand-primary)] flex-shrink-0" />
          <span className="text-base font-medium text-[#333333] whitespace-nowrap truncate">{guestLabel}</span>
        </div>

        {guestOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl z-50
                          shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0]">
            <GuestPicker value={guests} onChange={setGuests} />
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        aria-label="Search"
        className="bg-gradient-to-r from-[var(--brand-primary)] to-[#6d2200] hover:from-[#6d2200] hover:to-[#5a1c00] text-white px-8 h-[58px] flex items-center justify-center gap-2 font-bold text-[16px] transition-all duration-300 active:scale-95 flex-shrink-0"
        suppressHydrationWarning
      >
        <span>Search</span>
      </button>
    </div>
    </div>
  )
}