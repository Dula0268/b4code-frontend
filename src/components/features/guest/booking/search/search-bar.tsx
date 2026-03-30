"use client"

import { useState } from "react"
import { Search, MapPin, Calendar } from "lucide-react"

export default function SearchBar() {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search logic
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-[640px] bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="flex items-center gap-2 p-4 sm:p-3">
        {/* Location Input */}
        <div className="flex-1 flex items-center gap-2 border-r pr-3">
          <MapPin size={18} className="text-[#953002] flex-shrink-0" />
          <input
            type="text"
            placeholder="Where to?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 outline-none text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Check-in Date */}
        <div className="flex items-center gap-2 border-r pr-3">
          <Calendar size={18} className="text-[#953002] flex-shrink-0" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="outline-none text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Check-out Date */}
        <div className="flex items-center gap-2 border-r pr-3">
          <Calendar size={18} className="text-[#953002] flex-shrink-0" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="outline-none text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[#953002] text-white px-4 py-2 rounded-lg hover:bg-[#7d2600] transition-colors flex-shrink-0"
        >
          <Search size={18} />
          <span className="hidden sm:inline text-sm font-medium">Search</span>
        </button>
      </div>
    </form>
  )
}
