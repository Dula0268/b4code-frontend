"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, X, Heart, Star, Loader2 } from "lucide-react"

import FiltersSidebar, { type FilterState } from "./filters-sidebar"
import { ALL_PROPERTIES, type PropertyDetail } from "@/lib/mock-properties"

// Dynamically import the map (Leaflet must not run on server)
const MapView = dynamic(() => import("./map-view"), { ssr: false })

// ─── Types ──────────────────────────────────────────────────────────────────
export interface PropertyListing {
    id: string
    title: string
    location: string
    propertyType: string
    pricePerNight: number
    maxGuests: number
    baseGuests: number
    extraGuestFee: number
    rating: number
    reviewCount: number
    badge?: string
    imageSrc: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
    return `LKR ${amount.toLocaleString("en-US")}`
}

// ─── Inlined PropertyCard ─────────────────────────────────────────────────────
function PropertyCard({ listing }: { listing: PropertyListing }) {
    const [liked, setLiked] = useState(false)
    const searchParams = useSearchParams()
    const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""

    return (
        <Link
            href={`/guest/property/${listing.id}${query}`}
            className="group block no-underline text-inherit"
            aria-label={`View ${listing.title}`}
        >
            <article className="bg-[var(--bg)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 sm:active:scale-100">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--gray-5)]">
                    <Image
                        src={listing.imageSrc}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {listing.badge && (
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[var(--bg)] text-[var(--fg)] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                            {listing.badge}
                        </span>
                    )}
                    <button
                        id={`wishlist-${listing.id}`}
                        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setLiked(p => !p) }}
                        className={["absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer", liked ? "bg-[var(--brand-primary)] text-[var(--white)] shadow-md" : "bg-[var(--white)]/90 text-[var(--gray-2)] hover:bg-[var(--white)] hover:text-[var(--brand-primary)] shadow-sm"].join(" ")}
                    >
                        <Heart size={15} fill={liked ? "currentColor" : "none"} />
                    </button>
                </div>
                <div className="p-3 sm:p-4 flex flex-col gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                        {listing.propertyType}
                    </span>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[var(--fg)] leading-snug line-clamp-2 sm:line-clamp-1">
                            {listing.title}
                        </h3>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star size={12} className="text-[var(--brand-secondary)]" fill="currentColor" />
                            <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--fg)]">
                                {listing.rating.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <p className="text-[11px] sm:text-[12px] text-[var(--muted)]">
                        {listing.reviewCount.toLocaleString()} reviews
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-[var(--muted)]">
                        Up to {listing.maxGuests} guest{listing.maxGuests !== 1 ? "s" : ""}
                    </p>
                    <div className="border-t border-[var(--border)] mt-1 pt-2">
                        <p className="text-[12px] sm:text-[13px] text-[var(--muted)]">
                            Starting from <span className="text-[14px] sm:text-[15px] font-bold text-[var(--fg)]">{formatLKR(listing.pricePerNight)}</span><span className="text-[11px] sm:text-[12px] font-normal text-[var(--muted)]"> / night</span>
                        </p>
                    </div>
                </div>
            </article>
        </Link>
    )
}

// ─── Inlined ResultsHeader ────────────────────────────────────────────────────
type ActiveFilter = { id: string; label: string }

interface ResultsHeaderProps {
    destination?: string
    totalCount: number
    checkIn?: string
    checkOut?: string
    guests?: number
    activeFilters?: ActiveFilter[]
    onRemoveFilter?: (id: string) => void
}

function ResultsHeader({ destination, totalCount, checkIn, checkOut, guests, activeFilters = [], onRemoveFilter }: ResultsHeaderProps) {
    const subtitle = [
        `${totalCount} stays`,
        checkIn && checkOut ? `${checkIn} - ${checkOut}` : null,
        guests ? `${guests} Guest${guests !== 1 ? "s" : ""}` : null,
    ].filter(Boolean).join(" · ")

    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
                <div className="flex-1">
                    <h1 className="text-[clamp(24px,5vw,28px)] font-bold text-[var(--fg)] mb-0.5" style={{ lineHeight: "1.2" }}>
                        Stays in {destination || "Sri Lanka"}
                    </h1>
                    {subtitle && <p className="text-[12px] sm:text-[13px] text-[var(--muted)]">{subtitle}</p>}
                </div>
            </div>
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {activeFilters.map((f) => (
                        <div key={f.id} className="flex items-center gap-1 sm:gap-1.5 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-medium text-[var(--brand-primary)]">
                            <span className="truncate">{f.label}</span>
                            {onRemoveFilter && (
                                <button onClick={() => onRemoveFilter(f.id)} aria-label={`Remove ${f.label} filter`} className="text-[var(--brand-primary)]/70 hover:text-[var(--brand-primary)] cursor-pointer bg-transparent border-none p-0 leading-none flex-shrink-0">
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function toPropertyListing(property: PropertyDetail): PropertyListing {
    return {
        id: property.id,
        title: property.title,
        location: property.location,
        propertyType: property.propertyType,
        pricePerNight: property.pricePerNight,
        maxGuests: property.rooms.reduce((max, room) => Math.max(max, room.maxGuests), 0),
        baseGuests: 2,
        extraGuestFee: 5_000,
        rating: property.rating,
        reviewCount: property.reviewCount,
        badge: property.badge,
        imageSrc: property.imageSrc,
    }
}

// ─── Constants & Configuration ──────────────────────────────────────────────────
const SEARCH_RESULTS_CONFIG = {
    ITEMS_PER_PAGE: 6,
    DEFAULT_FILTERS: { priceMin: 10_000, priceMax: 500_000, amenities: [], propertyTypes: [], guestRating: null } as FilterState,
} as const;

// ─── Business Logic Hook ──────────────────────────────────────────────────────
function useSearchResultsLogic(destination: string, checkIn: string, checkOut: string, guests: number) {
    const [listings] = useState<PropertyListing[]>(() => ALL_PROPERTIES.map(toPropertyListing))
    const [loading] = useState(false)
    const [filters, setFilters] = useState<FilterState>(SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS)
    const [sortBy, setSortBy] = useState("recommended")
    const [page, setPage] = useState(1)
    const [mapOpen, setMapOpen] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Filtering
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

    // Sorting
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

    // Pagination
    const totalPages = Math.ceil(sorted.length / SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE)
    const paginated = sorted.slice((page - 1) * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE, page * SEARCH_RESULTS_CONFIG.ITEMS_PER_PAGE)

    const activeFilters: { id: string; label: string }[] = []
    if (filters.priceMax < 500_000 || filters.priceMin > 10_000) activeFilters.push({ id: "price", label: `Price: ${formatLKR(filters.priceMin)} - ${formatLKR(filters.priceMax)}${filters.priceMax === 500_000 ? "+" : ""}` })
    filters.propertyTypes.forEach(pt => activeFilters.push({ id: `type-${pt}`, label: `Type: ${pt}` }))
    if (filters.amenities.includes("Kitchen")) activeFilters.push({ id: "amenity-kitchen", label: "Kitchen" })

    const handleRemoveFilter = (filterId: string) => {
        setFilters(prev => {
            if (filterId === "price") return { ...prev, priceMin: SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS.priceMin, priceMax: SEARCH_RESULTS_CONFIG.DEFAULT_FILTERS.priceMax }
            if (filterId.startsWith("type-")) {
                const pType = filterId.replace("type-", "")
                return { ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== pType) }
            }
            if (filterId.startsWith("amenity-")) {
                const am = filterId.replace("amenity-", "")
                return { ...prev, amenities: prev.amenities.filter(a => a.toLowerCase() !== am) }
            }
            return prev
        })
    }
    
    return { listings, loading, filters, setFilters, sortBy, setSortBy, page, setPage, mapOpen, setMapOpen, hoveredId, setHoveredId, sorted, paginated, totalPages, activeFilters, handleRemoveFilter }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchResultsPage() {
    const searchParams = useSearchParams()
    const destination = searchParams.get("destination") || "Sri Lanka"
    const checkIn = searchParams.get("checkIn") || ""
    const checkOut = searchParams.get("checkOut") || ""
    const guests = Number(searchParams.get("guests") || 2)

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
        <div className="min-h-screen bg-[#fafafa]">
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
        </div>
    )
}
