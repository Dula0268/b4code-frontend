"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import FiltersSidebar, { type FilterState } from "./filters-sidebar"
import { useGuestBookingSearchStore } from "@/store/guest/booking/search.store"
import { ResultsHeader, PropertyCard, type PropertyListing } from "./components"
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

// Dynamically import the map (Leaflet must not run on server)
const MapView = dynamic(() => import("./components/map-view"), { ssr: false })

import { ALL_PROPERTIES } from "@/lib/mock-properties"

function getGuestAdjustedPrice(basePrice: number, guests: number, baseGuests: number, extraGuestFee: number) {
    const extraGuests = Math.max(0, guests - baseGuests)
    return basePrice + extraGuests * extraGuestFee
}

// ─── Map listing data dynamically to match real Room boundaries ────────
const ALL_LISTINGS: PropertyListing[] = ALL_PROPERTIES.map(p => {
    const validMaxGuests = Math.max(...p.rooms.map(r => r.maxGuests))
    return {
        id: p.id,
        title: p.title,
        location: p.location,
        propertyType: p.propertyType,
        pricePerNight: p.pricePerNight,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge,
        imageSrc: p.imageSrc,
        maxGuests: validMaxGuests,
        baseGuests: 2,
        extraGuestFee: 5000
    }
})

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
    const guests = Math.max(1, Number(searchParams.get("guests") || 2) || 1)

    const {
        filters,
        sortBy,
        page,
        mapOpen,
        mobileFiltersOpen,
        hoveredId,
        setFilters,
        setSortBy,
        setPage,
        setMapOpen,
        setMobileFiltersOpen,
        setHoveredId,
        clearFilters,
        removeFilter
    } = useGuestBookingSearchStore()

    const guestAdjustedListings = useMemo(() => {
        return ALL_LISTINGS.map(l => ({
            ...l,
            pricePerNight: getGuestAdjustedPrice(l.pricePerNight, guests, l.baseGuests, l.extraGuestFee),
        }))
    }, [guests])

    // ── Filtering ────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const query = destination.trim().toLowerCase()
        return guestAdjustedListings.filter(l => {
            // Filter by destination search term (title or location match)
            if (query && query !== "sri lanka") {
                const matchesTitle = l.title.toLowerCase().includes(query)
                const matchesLocation = l.location.toLowerCase().includes(query)
                if (!matchesTitle && !matchesLocation) return false
            }
            // Filter by guest capacity
            if (guests > l.maxGuests) return false
            // Filter by price range
            if (l.pricePerNight < filters.priceMin || l.pricePerNight > filters.priceMax) return false
            // Filter by property type
            if (filters.propertyTypes.length > 0) {
                if (!filters.propertyTypes.includes(l.propertyType)) return false
            }
            // Filter by guest rating
            if (filters.guestRating) {
                if (l.rating < Number(filters.guestRating)) return false
            }
            return true
        })
    }, [filters, destination, guestAdjustedListings, guests])

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

    const handleClearFilters = clearFilters

    const handleFiltersChange = (next: FilterState) => {
        setFilters(next)
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

    const handleRemoveFilter = removeFilter


    return (
        <div className="min-h-screen bg-[#fafafa]">

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 sm:pb-16">
                <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">

                    {/* ── Filters Sidebar ─────────────────────────────────────────── */}
                    <div className="hidden lg:block w-[256px] flex-shrink-0">
                        <FiltersSidebar
                            filters={filters}
                            onChange={handleFiltersChange}
                            onClear={handleClearFilters}
                        />
                    </div>

                    {/* ── Results ─────────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">

                        {/* Mobile filter controls */}
                        <div className="lg:hidden mb-4">
                            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#1d1d1d] shadow-sm"
                                        aria-label="Open filters"
                                    >
                                        <SlidersHorizontal size={14} />
                                        Filters
                                        <span className="text-[#828282]">({activeFilters.length})</span>
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[90vw] max-w-[360px] overflow-y-auto p-0">
                                    <SheetHeader className="border-b border-[#e0e0e0]">
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="px-4 pb-6 pt-2">
                                        <FiltersSidebar
                                            filters={filters}
                                            onChange={handleFiltersChange}
                                            onClear={() => {
                                                handleClearFilters()
                                                setMobileFiltersOpen(false)
                                            }}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

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
                        <div className={["flex flex-col lg:flex-row gap-4", mapOpen ? "items-start" : ""].join(" ")}>

                            {/* ── Property grid (shrinks when map is open) ── */}
                            <div className={mapOpen ? "w-full lg:w-[45%] lg:flex-shrink-0" : "flex-1 min-w-0"}>

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
                                            Try reducing guest count, adjusting your price range, or removing some filters.
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
                                <div className="hidden lg:block flex-1 sticky top-20" style={{ height: "calc(100vh - 100px)" }}>
                                    <MapView
                                        listings={sorted}
                                        hoveredId={hoveredId}
                                    />
                                </div>
                            )}

                        </div>{/* end grid+map flex */}

                        {/* ── Pagination ──────────────────────────────────────────────── */}
                        {totalPages > 1 && (
                            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto pb-1">
                                    {/* Prev */}
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        aria-label="Previous page"
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[#953002]/40 hover:text-[#953002] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer flex-shrink-0"
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
                                                "w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer border flex-shrink-0",
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
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[#953002]/40 hover:text-[#953002] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer flex-shrink-0"
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
