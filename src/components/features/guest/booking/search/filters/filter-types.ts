// ─── Shared filter state type ─────────────────────────────────────────────
// Imported by every sub-filter and by the parent FiltersSidebar.

export interface FilterState {
    priceMin: number
    priceMax: number
    amenities: string[]
    propertyTypes: string[]
    guestRating: string | null
}
