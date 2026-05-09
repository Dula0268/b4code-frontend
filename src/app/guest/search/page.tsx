"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, SearchX, WifiOff } from "lucide-react"

import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import FiltersSidebar, { type FilterState } from "@/components/features/guest/search/filters-sidebar"
import PropertyCard from "@/components/features/guest/search/property-card"
import ResultsHeader from "@/components/features/guest/search/results-header"
import {
    searchProperties,
    getFilterOptions,
    type PropertyListing,
    type PaginatedResponse,
    type FilterOptionsResponse,
} from "@/api/guest/search.api"

const MapView = dynamic(() => import("@/components/features/guest/search/map-view"), { ssr: false })

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
    return `LKR ${amount.toLocaleString("en-US")}`
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#e0e0e0] shadow-sm animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>
        </div>
    )
}

function ResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
    )
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <WifiOff size={28} className="text-red-400" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1d1d1d] mb-2">Unable to load properties</h3>
            <p className="text-[14px] text-[#828282] mb-4 max-w-md">{message}</p>
            <button
                onClick={onRetry}
                className="px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white rounded-xl hover:bg-[#6d2200] transition-colors cursor-pointer"
            >
                Try again
            </button>
        </div>
    )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#fff4eb] flex items-center justify-center mb-4">
                <SearchX size={28} className="text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1d1d1d] mb-2">No properties match your filters</h3>
            <p className="text-[14px] text-[#828282] mb-4">Try adjusting your price range or removing some filters.</p>
            <button
                onClick={onClear}
                className="px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white rounded-xl hover:bg-[#6d2200] transition-colors cursor-pointer"
            >
                Clear all filters
            </button>
        </div>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
    page, totalPages, totalElements, pageSize, onPageChange,
}: {
    page: number; totalPages: number; totalElements: number; pageSize: number;
    onPageChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null

    const start = page * pageSize + 1
    const end = Math.min((page + 1) * pageSize, totalElements)

    // Show limited page buttons
    const pages: number[] = []
    const maxButtons = 7
    let startPage = Math.max(0, page - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxButtons - 1)
    if (endPage - startPage < maxButtons - 1) startPage = Math.max(0, endPage - maxButtons + 1)
    for (let i = startPage; i <= endPage; i++) pages.push(i)

    return (
        <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"
                >
                    <ChevronLeft size={16} />
                </button>
                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={[
                            "w-9 h-9 rounded-xl text-[14px] font-medium transition-colors cursor-pointer border",
                            p === page
                                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                                : "bg-white text-[#333333] border-[#e0e0e0] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)]",
                        ].join(" ")}
                    >
                        {p + 1}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="w-9 h-9 rounded-xl border border-[#e0e0e0] flex items-center justify-center text-[#333333] hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-white cursor-pointer"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            <p className="text-[12px] text-[#828282]">
                {start}–{end} of {totalElements} stays
            </p>
        </div>
    )
}

// ─── Main Content ────────────────────────────────────────────────────────────
function SearchResultsContent() {
    const searchParams = useSearchParams()
    const destination = searchParams?.get("destination") || ""
    const checkIn = searchParams?.get("checkIn") || ""
    const checkOut = searchParams?.get("checkOut") || ""
    const guests = Number(searchParams?.get("guests") || 2)

    // State
    const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null)
    const [filtersLoading, setFiltersLoading] = useState(true)
    const [results, setResults] = useState<PaginatedResponse<PropertyListing> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [filters, setFilters] = useState<FilterState>({
        priceMin: 0,
        priceMax: 1000000,
        amenities: [],
        propertyTypes: [],
        guestRating: null,
    })
    const [sortBy, setSortBy] = useState("recommended")
    const [page, setPage] = useState(0)
    const [mapOpen, setMapOpen] = useState(false)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    const PAGE_SIZE = 6

    // Load filter options once
    useEffect(() => {
        let active = true
        async function load() {
            try {
                const opts = await getFilterOptions()
                if (!active) return
                setFilterOptions(opts)
                // Initialize price range from backend
                setFilters(prev => ({
                    ...prev,
                    priceMin: opts.priceRange.min,
                    priceMax: opts.priceRange.max,
                }))
            } catch (err) {
                console.error("Failed to load filter options:", err)
            } finally {
                if (active) setFiltersLoading(false)
            }
        }
        load()
        return () => { active = false }
    }, [])

    // Search properties when filters/page/sort change
    const fetchResults = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await searchProperties({
                destination: destination || undefined,
                checkIn: checkIn || undefined,
                checkOut: checkOut || undefined,
                guests,
                minPrice: filterOptions ? filters.priceMin : undefined,
                maxPrice: filterOptions ? filters.priceMax : undefined,
                minRating: filters.guestRating ? parseFloat(filters.guestRating) : undefined,
                propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
                amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
                sortBy,
                page,
                size: PAGE_SIZE,
            })
            setResults(data)
        } catch (err) {
            console.error("Search failed:", err)
            setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching properties.")
        } finally {
            setLoading(false)
        }
    }, [destination, checkIn, checkOut, guests, filters, sortBy, page, filterOptions])

    useEffect(() => {
        if (!filtersLoading) fetchResults()
    }, [fetchResults, filtersLoading])

    // Reset page when filters change
    const handleFiltersChange = (next: FilterState) => {
        setFilters(next)
        setPage(0)
    }

    const handleSortChange = (next: string) => {
        setSortBy(next)
        setPage(0)
    }

    const defaultFilters: FilterState = filterOptions
        ? { priceMin: filterOptions.priceRange.min, priceMax: filterOptions.priceRange.max, amenities: [], propertyTypes: [], guestRating: null }
        : { priceMin: 0, priceMax: 1000000, amenities: [], propertyTypes: [], guestRating: null }

    const handleClearFilters = () => {
        setFilters(defaultFilters)
        setPage(0)
    }

    // Active filter pills
    const activeFilters: { id: string; label: string }[] = []
    if (filterOptions) {
        const pr = filterOptions.priceRange
        if (filters.priceMax < pr.max || filters.priceMin > pr.min) {
            activeFilters.push({
                id: "price",
                label: `Price: ${formatLKR(filters.priceMin)} - ${formatLKR(filters.priceMax)}${filters.priceMax >= pr.max ? "+" : ""}`,
            })
        }
    }
    filters.propertyTypes.forEach(pt => activeFilters.push({ id: `type-${pt}`, label: `Type: ${pt}` }))
    filters.amenities.forEach(am => activeFilters.push({ id: `amenity-${am}`, label: am }))
    if (filters.guestRating) activeFilters.push({ id: "rating", label: `Rating: ${filters.guestRating}+` })

    const handleRemoveFilter = (filterId: string) => {
        setFilters(prev => {
            if (filterId === "price") return { ...prev, priceMin: defaultFilters.priceMin, priceMax: defaultFilters.priceMax }
            if (filterId === "rating") return { ...prev, guestRating: null }
            if (filterId.startsWith("type-")) return { ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== filterId.replace("type-", "")) }
            if (filterId.startsWith("amenity-")) return { ...prev, amenities: prev.amenities.filter(a => a !== filterId.replace("amenity-", "")) }
            return prev
        })
        setPage(0)
    }

    const mapListings = (results?.content || []).map(l => ({
        ...l,
        id: String(l.id)
    })) as unknown as PropertyListing[];

    const listings = results?.content || []
    const totalElements = results?.totalElements || 0
    const totalPages = results?.totalPages || 0

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-[260px] xl:w-[280px] flex-shrink-0">
                    <div className="sticky top-24">
                        <FiltersSidebar
                            filters={filters}
                            onChange={handleFiltersChange}
                            onClear={handleClearFilters}
                            sortBy={sortBy}
                            onSortChange={handleSortChange}
                            mapOpen={mapOpen}
                            onToggleMap={() => setMapOpen(o => !o)}
                            filterOptions={filterOptions}
                            loading={filtersLoading}
                        />
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 min-w-0">
                    <ResultsHeader
                        destination={destination || "Sri Lanka"}
                        totalCount={totalElements}
                        checkIn={checkIn || undefined}
                        checkOut={checkOut || undefined}
                        guests={guests}
                        activeFilters={activeFilters}
                        onRemoveFilter={handleRemoveFilter}
                    />

                    <div className={["flex gap-4", mapOpen ? "items-start" : ""].join(" ")}>
                        <div className={mapOpen ? "w-[45%] flex-shrink-0" : "flex-1 min-w-0"}>
                            {loading ? (
                                <ResultsSkeleton />
                            ) : error ? (
                                <ErrorState message={error} onRetry={fetchResults} />
                            ) : listings.length > 0 ? (
                                <div className={["grid gap-5", mapOpen ? "grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"].join(" ")}>
                                    {listings.map(listing => (
                                        <div
                                            key={listing.id}
                                            onMouseEnter={() => setHoveredId(String(listing.id))}
                                            onMouseLeave={() => setHoveredId(null)}
                                        >
                                            <PropertyCard listing={{
                                                ...listing,
                                                id: String(listing.id),
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState onClear={handleClearFilters} />
                            )}
                        </div>

                        {mapOpen && (
                            <div className="flex-1 sticky top-20" style={{ height: "calc(100vh - 100px)" }}>
                                <MapView listings={mapListings} hoveredId={hoveredId} />
                            </div>
                        )}
                    </div>

                    {!loading && !error && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                        />
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
                            <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
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
