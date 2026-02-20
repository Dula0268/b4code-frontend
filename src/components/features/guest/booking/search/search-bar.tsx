"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Users, Search } from "lucide-react"

export default function SearchBar() {
  const router = useRouter()
  const [destination, setDestination] = useState("")
  const [dates, setDates] = useState("")
  const [guests, setGuests] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams({
      ...(destination && { destination }),
      ...(dates && { dates }),
      ...(guests && { guests }),
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div
      role="search"
      className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-1 shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[620px]"
    >
      <div className="flex items-center gap-2 flex-[2] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        <MapPin size={16} className="text-[#953002] flex-shrink-0" />
        <input
          type="text"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Where are you going?"
          className="border-none outline-none text-sm text-[#333333] placeholder:text-[#828282] bg-transparent w-full"
        />
      </div>

      <div className="hidden md:block w-px bg-[#e0e0e0] my-2" />

      <div className="flex items-center gap-2 flex-[1.5] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        <Calendar size={16} className="text-[#953002] flex-shrink-0" />
        <input
          type="text"
          value={dates}
          onChange={e => setDates(e.target.value)}
          placeholder="Dates"
          className="border-none outline-none text-sm text-[#333333] placeholder:text-[#828282] bg-transparent w-full"
        />
      </div>

      <div className="hidden md:block w-px bg-[#e0e0e0] my-2" />

      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        <Users size={16} className="text-[#953002] flex-shrink-0" />
        <input
          type="text"
          value={guests}
          onChange={e => setGuests(e.target.value)}
          placeholder="Guests"
          className="border-none outline-none text-sm text-[#333333] placeholder:text-[#828282] bg-transparent w-full"
        />
      </div>

      <button
        onClick={handleSearch}
        aria-label="Search"
        className="bg-[#953002] hover:bg-[#6d2200] text-white rounded-lg w-11 h-11 flex items-center justify-center flex-shrink-0 transition-colors self-center"
      >
        <Search size={18} />
      </button>
    </div>
  )
}