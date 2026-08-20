"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Star, MapPin, Check } from "lucide-react"

export interface PropertyListing {
    id: string
    title: string
    location: string
    propertyType: string
    pricePerNight: number
    highestPricePerNight?: number
    maxGuests: number
    baseGuests: number
    extraGuestFee: number
    rating: number
    reviewCount: number
    badge?: string
    imageSrc: string
    amenities?: string[]
}

function formatLKR(amount: number) {
    return `LKR ${amount.toLocaleString("en-US")}`
}

export default function PropertyCard({ listing }: { listing: PropertyListing }) {
    const [imgError, setImgError] = useState(false)
    const searchParams = useSearchParams()
    const query = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : ""

    const maxPrice = listing.highestPricePerNight && listing.highestPricePerNight > listing.pricePerNight 
        ? listing.highestPricePerNight 
        : listing.pricePerNight + (Math.max(0, listing.maxGuests - listing.baseGuests) * listing.extraGuestFee)

    return (
        <Link
            href={`/guest/property/${listing.id}${query}`}
            className="group block no-underline text-inherit h-full"
            aria-label={`View ${listing.title}`}
        >
            <article className="h-full flex flex-col bg-[var(--bg)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] sm:active:scale-100">
                {/* Image */}
                <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-[var(--gray-5)]">
                    {!imgError ? (
                        <Image
                            src={listing.imageSrc}
                            alt={listing.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5e6d8] to-[#e8d5c4]">
                            <span className="text-[var(--brand-primary)] text-sm font-medium opacity-60">No Image</span>
                        </div>
                    )}

                    {/* Badge */}
                    {listing.badge && (
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[var(--bg)] text-[var(--fg)] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm backdrop-blur-sm">
                            {listing.badge}
                        </span>
                    )}

                </div>

                {/* Content */}
                <div className="p-2.5 flex flex-col flex-1 gap-1">

                    {/* Title + Rating */}
                    <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-[13px] sm:text-[14px] font-semibold text-[var(--fg)] leading-snug line-clamp-1">
                            {listing.title}
                        </h3>
                        {listing.rating > 0 && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                <Star size={11} className="text-[var(--brand-secondary)]" fill="currentColor" />
                                <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--fg)]">
                                    {listing.rating.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <p className="text-[11px] sm:text-[12px] text-[var(--muted)] flex items-center gap-1">
                        <MapPin size={11} className="flex-shrink-0" />
                        {listing.location}
                    </p>

                    {/* Review count */}
                    <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-[var(--muted)]">
                        <span>{listing.reviewCount.toLocaleString()} total reviews</span>
                    </div>

                    {/* Amenities / Advanced Filters */}
                    {listing.amenities && listing.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1 mb-1.5">
                            {listing.amenities.map((amenity, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-[11px] sm:text-[11.5px] text-[var(--muted)] font-medium">
                                    <Check size={11} className="text-[var(--state-success)] flex-shrink-0" strokeWidth={3} />
                                    {amenity === "Breakfast Included" ? "Breakfast" : amenity}
                                </span>
                            ))}
                        </div>
                    )}                    {/* Price Range */}
                    <div className="border-t border-[var(--border)] mt-auto pt-1.5 flex flex-col">
                        {maxPrice > listing.pricePerNight ? (
                            <>
                                <span className="text-[9px] sm:text-[10px] text-[var(--muted)] uppercase tracking-wide font-semibold mb-0.5">Price Range</span>
                                <p className="text-[13px] sm:text-[14px] font-bold text-[var(--fg)]">
                                    {formatLKR(listing.pricePerNight)} <span className="text-[11px] font-medium text-[var(--muted)]">-</span> {formatLKR(maxPrice)}
                                </p>
                            </>
                        ) : (
                            <>
                                <span className="text-[9px] sm:text-[10px] text-[var(--muted)] uppercase tracking-wide font-semibold mb-0.5">Price</span>
                                <p className="text-[13px] sm:text-[14px] font-bold text-[var(--fg)]">
                                    {formatLKR(listing.pricePerNight)} <span className="text-[11px] font-medium text-[var(--muted)]">/ night</span>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    )
}
