"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import FiltersSidebar, { type FilterState } from "@/components/features/guest/search/filters-sidebar"
import PropertyCard, { type PropertyListing } from "@/components/features/guest/search/property-card"
import ResultsHeader from "@/components/features/guest/search/results-header"

import { guestApi } from "@/lib/api"
import { ALL_PROPERTIES, type PropertyDetail } from "@/lib/mock-properties"

const MapView = dynamic(() => import("@/components/features/guest/search/map-view"), { ssr: false })

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
    return `LKR ${amount.toLocaleString("en-US")}`
}

function toPropertyListing(property: Partial<PropertyDetail> & Record<string, unknown>): PropertyListing {
    const rooms = Array.isArray(property.rooms) ? property.rooms : Array.isArray(property.availableRooms) ? property.availableRooms : []
    const maxGuests = rooms.reduce((max: number, room: Record<string, unknown>) => Math.max(max, Number(room?.maxGuests ?? room?.maxOccupancy ?? 0)), 0)
    const pricePerNight = Number(property.pricePerNight ?? property.lowestPricePerNight ?? rooms[0]?.pricePerNight ?? 0)

    return {
        id: String(property.id ?? property.propertyId ?? ""),
        title: property.title ?? property.name ?? "Untitled property",
        location: property.location ?? property.city ?? "Sri Lanka",
        propertyType: property.propertyType ?? "Property",
        pricePerNight,
        maxGuests: maxGuests > 0 ? maxGuests : Number(property.maxGuests ?? 2),
        baseGuests: Number(property.baseGuests ?? 2),
        extraGuestFee: Number(property.extraGuestFee ?? 5_000),
        rating: Number(property.rating ?? property.averageRating ?? 0),
        reviewCount: Number(property.reviewCount ?? 0),
        badge: property.badge,
        imageSrc: property.imageSrc ?? property.imageUrl ?? "/images/properties/property-1.jpg",
    }
}

// ─── Constants & Configuration ──────────────────────────────────────────────────
const SEARCH_RESULTS_CONFIG = {
    ITEMS_PER_PAGE: 6,
    DEFAULT_FILTERS: { priceMin: 10_000, priceMax: 500_000, amenities: [], propertyTypes: [], guestRating: null } as FilterState,
} as const;

// ─── Business Logic Hook ──────────────────────────────────────────────────────
function useSearchResultsLogic(destination: string, _checkIn: string, _checkOut: string, _guests: number) {
    const [listings, setListings] = useState<PropertyListing[]>(() => ALL_PROPERTIES.map(toPropertyListing))
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<FilterState>(SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS)
    const [sortBy, setSortBy] = useState("recommended")
    const [page, setPage] = useState(1)
    const [mapOpen, setMapOpen] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        async function loadListings() {
            try {
                const data = await guestApi.getAllProperties()
                if (!active) return
                const merged = data.length > 0
                    ? data.map((item: Record<string, unknown>) => {
                        const fallback = ALL_PROPERTIES.find(property => property.id === String(item.id))
                        return toPropertyListing({ ...fallback, ...item })
                    })
                    : ALL_PROPERTIES.map(toPropertyListing)
                setListings(merged)
            } catch {
                if (active) setListings(ALL_PROPERTIES.map(toPropertyListing))
            } finally {
                if (active) setLoading(false)
            }
        }
        loadListings()
        return () => { active = false }
    }, [])

    const filtered = useMemo(() => {
        const query = destination.trim().toLowerCase()
        return listings.filter(l => {
            if (query && query !== "sri lanka") {
                const matchesTitle = l.title.toLowerCase().includes(query)
                const matchesLocation = l.location.toLowerCase().includes(query)
                if (!matchesTitle && !matchesLocation) return false
            }
            if (l.pricePerNight < filters.priceMin || l.pricePerNight > filters.priceMax) return false
            if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(l.propertyType)) return false
            if (filters.guestRating && l.rating < Number(filters.guestRating)) return false
            return true
        })
    }, [listings, filters, destination])

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

    const totalPages = Math.ceil(sorted.length / SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE)
    const paginated = sorted.slice((page - 1) * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE, page * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE)

    const activeFilters: { id: string; label: string }[] = []
    if (filters.priceMax < 500_000 || filters.priceMin > 10_000) activeFilters.push({ id: "price", label: `Price: ${formatLKR(filters.priceMin)} - ${formatLKR(filters.priceMax)}${filters.priceMax === 500_000 ? "+" : ""}` })
    filters.propertyTypes.forEach(pt => activeFilters.push({ id: `type-${pt}`, label: `Type: ${pt}` }))
    if (filters.amenities.includes("Kitchen")) activeFilters.push({ id: "amenity-kitchen", label: "Kitchen" })

    const handleRemoveFilter = (filterId: string) => {
        setFilters(prev => {
            if (filterId === "price") return { ...prev, priceMin: SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS.priceMin, priceMax: SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS.priceMax }
            if (filterId.startsWith("type-")) return { ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== filterId.replace("type-", "")) }
            if (filterId.startsWith("amenity-")) return { ...prev, amenities: prev.amenities.filter(a => a.toLowerCase() !== filterId.replace("amenity-", "")) }
            return prev
        })
    }
    
    return { listings, loading, filters, setFilters, sortBy, setSortBy, page, setPage, mapOpen, setMapOpen, hoveredId, setHoveredId, sorted, paginated, totalPages, activeFilters, handleRemoveFilter }
}

// ─── Main Content ────────────────────────────────────────────────────────────────
function SearchResultsContent() {
    const searchParams = useSearchParams()
    const destination = searchParams?.get("destination") || "Sri Lanka"
    const checkIn = searchParams?.get("checkIn") || ""
    const checkOut = searchParams?.get("checkOut") || ""
    const guests = Number(searchParams?.get("guests") || 2)

    const logic = useSearchResultsLogic(destination, checkIn, checkOut, guests);
    const { loading, filters, setFilters, sortBy, setSortBy, page, setPage, mapOpen, setMapOpen, hoveredId, setHoveredId, sorted, paginated, totalPages, activeFilters, handleRemoveFilter } = logic;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
                    <p className="text-[14px] text-[#828282]">Finding the perfect stays…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-[260px] xl:w-[280px] flex-shrink-0">
                    <div className="sticky top-24">
                        <FiltersSidebar
                            filters={filters}
                            onChange={setFilters}
                            onClear={() => setFilters(SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS)}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            mapOpen={mapOpen}
                            onToggleMap={() => setMapOpen(o => !o)}
                        />
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 min-w-0">
                    <ResultsHeader
                        destination={destination}
                        totalCount={sorted.length}
                        checkIn={checkIn || undefined}
                        checkOut={checkOut || undefined}
                        guests={guests}
                        activeFilters={activeFilters}
                        onRemoveFilter={handleRemoveFilter}
                    />

                    <div className={["flex gap-4", mapOpen ? "items-start" : ""].join(" ")}>
                        <div className={mapOpen ? "w-[45%] flex-shrink-0" : "flex-1 min-w-0"}>
                            {paginated.length > 0 ? (
                                <div className={["grid gap-5", mapOpen ? "grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"].join(" ")}>
                                    {paginated.map(listing => (
                                        <div key={listing.id} onMouseEnter={() => setHoveredId(listing.id)} onMouseLeave={() => setHoveredId(null)}>
                                            <PropertyCard listing={listing} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="text-5xl mb-4">🏡</div>
                                    <h3 className="text-[18px] font-semibold text-[#1d1d1d] mb-2">No properties match your filters</h3>
                                    <p className="text-[14px] text-[#828282] mb-4">Try adjusting your price range or removing some filters.</p>
                                    <button onClick={() => setFilters(SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS)} className="px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white rounded-xl hover:bg-[#6d2200] transition-colors">
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {mapOpen && (
                            <div className="flex-1 sticky top-20" style={{ height: "calc(100vh - 100px)" }}>
                                <MapView listings={sorted} hoveredId={hoveredId} />
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-10 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"><ChevronLeft size={16} /></button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} className={["w-9 h-9 rounded-xl text-[14px] font-medium transition-colors cursor-pointer border", p === page ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "bg-white text-[#333333] border-[#e0e0e0] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)]"].join(" ")}>{p}</button>
                                ))}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"><ChevronRight size={16} /></button>
                            </div>
                            <p className="text-[12px] text-[#828282]">{(page - 1) * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE + 1}–{Math.min(page * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE, sorted.length)} of {sorted.length} stays</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1">
                <Suspense fallback={
                    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-[#953002]/30 border-t-[#953002] rounded-full animate-spin" />
                            <p className="text-[14px] text-[#828282]">Finding the perfect stays…</p>
                        </div>
                    </div>
                }>
                    <SearchResultsContent />
                </Suspense>
            </main>
            <GuestFooter />
        </div>
    )
}
