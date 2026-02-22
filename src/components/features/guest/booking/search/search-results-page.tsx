"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import FiltersSidebar, { type FilterState } from "./filters-sidebar"
import ResultsHeader from "./results-header"
import PropertyCard, { type PropertyListing } from "./property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Dynamically import the map (Leaflet must not run on server)
const MapView = dynamic(() => import("./map-view"), { ssr: false })

// ─── Mock listing data ────────────────────────────────────────────────────
const ALL_LISTINGS: PropertyListing[] = [
    { id: "1", title: "Colombo Sky Residency", location: "Colombo 3", propertyType: "Apartment", pricePerNight: 25_000, rating: 4.92, reviewCount: 148, badge: "Superhost", imageSrc: "/images/properties/property-1.jpg" },
    { id: "2", title: "Galle Fort Heritage Cottage", location: "Galle Fort", propertyType: "Guesthouse", pricePerNight: 35_000, rating: 4.85, reviewCount: 92, imageSrc: "/images/properties/property-2.jpg" },
    { id: "3", title: "Kandy Hilltop Luxury Villa", location: "Kandy", propertyType: "Villa", pricePerNight: 75_000, rating: 5.0, reviewCount: 67, badge: "Guest favorite", imageSrc: "/images/properties/property-3.jpg" },
    { id: "4", title: "Colombo Boutique Business Suite", location: "Colombo 7", propertyType: "Apartment", pricePerNight: 85_000, rating: 4.75, reviewCount: 53, imageSrc: "/images/properties/property-4.jpg" },
    { id: "5", title: "Negombo Beachside Retreat", location: "Negombo", propertyType: "Hotel", pricePerNight: 95_000, rating: 4.98, reviewCount: 211, badge: "Superhost", imageSrc: "/images/properties/property-5.jpg" },
    { id: "6", title: "Ella Mountain Eco Cabin", location: "Ella", propertyType: "Villa", pricePerNight: 45_000, rating: 4.88, reviewCount: 134, imageSrc: "/images/properties/property-6.jpg" },
    { id: "7", title: "Mirissa Oceanfront Villa", location: "Mirissa", propertyType: "Villa", pricePerNight: 120_000, rating: 4.96, reviewCount: 88, badge: "Guest favorite", imageSrc: "/images/properties/property-7.jpg" },
    { id: "8", title: "Galle Dutch Period Mansion", location: "Galle Fort", propertyType: "Villa", pricePerNight: 180_000, rating: 4.91, reviewCount: 45, badge: "Superhost", imageSrc: "/images/properties/property-8.jpg" },
    { id: "9", title: "Nuwara Eliya Tea Planter's Bungalow", location: "Nuwara Eliya", propertyType: "Guesthouse", pricePerNight: 65_000, rating: 4.82, reviewCount: 109, imageSrc: "/images/properties/property-9.jpg" },
    { id: "10", title: "Arugam Bay Surf House", location: "Arugam Bay", propertyType: "Guesthouse", pricePerNight: 28_000, rating: 4.79, reviewCount: 176, imageSrc: "/images/properties/property-10.jpg" },
    { id: "11", title: "Sigiriya Rock View Lodge", location: "Sigiriya", propertyType: "Hotel", pricePerNight: 55_000, rating: 4.94, reviewCount: 203, badge: "Guest favorite", imageSrc: "/images/properties/property-11.jpg" },
    { id: "12", title: "Bentota Lagoon Water Villa", location: "Bentota", propertyType: "Villa", pricePerNight: 90_000, rating: 4.87, reviewCount: 61, imageSrc: "/images/properties/property-12.jpg" },
]

const ITEMS_PER_PAGE = 6

const DEFAULT_FILTERS: FilterState = {
    priceMin: 10_000,
    priceMax: 500_000,
    amenities: [],
    propertyTypes: [],
    guestRating: null,
}

function formatLKR(v: number) {
    return `LKR ${v.toLocaleString("en-US")}`
}

export default function SearchResultsPage() {
    const searchParams = useSearchParams()
    const destination = searchParams.get("destination") || "Sri Lanka"
    const checkIn = searchParams.get("checkIn") || ""
    const checkOut = searchParams.get("checkOut") || ""
    const guests = Number(searchParams.get("guests") || 2)

    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
    const [sortBy, setSortBy] = useState("recommended")
    const [page, setPage] = useState(1)
    const [mapOpen, setMapOpen] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // ── Filtering ────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return ALL_LISTINGS.filter(l => {
            if (l.pricePerNight < filters.priceMin || l.pricePerNight > filters.priceMax) return false
            if (filters.propertyTypes.length > 0) {
                // Simple: all our mock listings are "Apartment" or "House" — just filter by property type name match
                // In real app this would use l.type field
            }
            if (filters.guestRating) {
                if (l.rating < Number(filters.guestRating)) return false
            }
            return true
        })
    }, [filters])

    // ── Sorting ──────────────────────────────────────────────────────────────
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "price_asc": return a.pricePerNight - b.pricePerNight
                case "price_desc": return b.pricePerNight - a.pricePerNight
                case "rating": return b.rating - a.rating
                default: return 0
            }
        })
    }, [filtered, sortBy])

    // ── Pagination ───────────────────────────────────────────────────────────
    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
    const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const handleClearFilters = () => {
        setFilters(DEFAULT_FILTERS)
        setPage(1)
    }

    const handleFiltersChange = (next: FilterState) => {
        setFilters(next)
        setPage(1)
    }

    // ── Build active filter chips ────────────────────────────────────────────
    const activeFilters: { id: string; label: string }[] = []
    if (filters.priceMax < 500_000 || filters.priceMin > 10_000) {
        activeFilters.push({
            id: "price",
            label: `Price: ${formatLKR(filters.priceMin)} - ${formatLKR(filters.priceMax)}${filters.priceMax === 500_000 ? "+" : ""}`,
        })
    }
    filters.propertyTypes.forEach(pt => {
        activeFilters.push({ id: `type-${pt}`, label: `Type: ${pt}` })
    })
    if (filters.amenities.includes("Kitchen")) {
        activeFilters.push({ id: "amenity-kitchen", label: "Kitchen" })
    }

    const handleRemoveFilter = (id: string) => {
        if (id === "price") {
            setFilters(f => ({ ...f, priceMin: 10_000, priceMax: 500_000 }))
        } else if (id.startsWith("type-")) {
            const pt = id.replace("type-", "")
            setFilters(f => ({ ...f, propertyTypes: f.propertyTypes.filter(t => t !== pt) }))
        } else if (id === "amenity-kitchen") {
            setFilters(f => ({ ...f, amenities: f.amenities.filter(a => a !== "Kitchen") }))
        }
    }


    return (
        <div className="min-h-screen bg-[#fafafa]">

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div className="max-w-[1440px] mx-auto px-[30px] pt-24 pb-16">
                <div className="flex gap-8">

                    {/* ── Filters Sidebar ─────────────────────────────────────────── */}
                    <FiltersSidebar
                        filters={filters}
                        onChange={handleFiltersChange}
                        onClear={handleClearFilters}
                    />

                    {/* ── Results ─────────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Results header */}
                        <ResultsHeader
                            destination={destination}
                            totalCount={sorted.length}
                            checkIn={checkIn || undefined}
                            checkOut={checkOut || undefined}
                            guests={guests}
                            activeFilters={activeFilters}
                            onRemoveFilter={handleRemoveFilter}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            mapOpen={mapOpen}
                            onToggleMap={() => setMapOpen(o => !o)}
                        />

                        {/* Grid + optional Map split */}
                        <div className={["flex gap-4", mapOpen ? "items-start" : ""].join(" ")}>

                            {/* ── Property grid (shrinks when map is open) ── */}
                            <div className={mapOpen ? "w-[45%] flex-shrink-0" : "flex-1 min-w-0"}>

                                {paginated.length > 0 ? (
                                    <div className={[
                                        "grid gap-5",
                                        mapOpen
                                            ? "grid-cols-1"
                                            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                                    ].join(" ")}>
                                        {paginated.map(listing => (
                                            <div
                                                key={listing.id}
                                                onMouseEnter={() => setHoveredId(listing.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                            >
                                                <PropertyCard listing={listing} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="text-5xl mb-4">🏡</div>
                                        <h3
                                            className="text-[18px] font-semibold text-[#1d1d1d] mb-2"
                                            style={{ fontSize: "18px", fontWeight: 600, color: "#1d1d1d" }}
                                        >
                                            No properties match your filters
                                        </h3>
                                        <p className="text-[14px] text-[#828282] mb-4">
                                            Try adjusting your price range or removing some filters.
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-5 py-2.5 text-sm font-semibold bg-[#953002] text-white rounded-xl hover:bg-[#6d2200] transition-colors"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}

                            </div>{/* end grid wrapper */}

                            {/* ── Map Panel ── */}
                            {mapOpen && (
                                <div className="flex-1 sticky top-20" style={{ height: "calc(100vh - 100px)" }}>
                                    <MapView
                                        listings={sorted}
                                        hoveredId={hoveredId}
                                    />
                                </div>
                            )}

                        </div>{/* end grid+map flex */}

                        {/* ── Pagination ──────────────────────────────────────────────── */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {/* Prev */}
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        aria-label="Previous page"
                                        className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[#953002]/40 hover:text-[#953002] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            id={`page-${p}`}
                                            onClick={() => setPage(p)}
                                            className={[
                                                "w-9 h-9 rounded-xl text-[14px] font-medium transition-colors cursor-pointer border",
                                                p === page
                                                    ? "bg-[#953002] text-white border-[#953002]"
                                                    : "bg-white text-[#333333] border-[#e0e0e0] hover:border-[#953002]/40 hover:text-[#953002]",
                                            ].join(" ")}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    {/* Next */}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        aria-label="Next page"
                                        className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[#953002]/40 hover:text-[#953002] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <p className="text-[12px] text-[#828282]">
                                    {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} stays
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
