"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Heart, Star } from "lucide-react"

// ─── Type ─────────────────────────────────────────────────────────────────────
export interface PropertyListing {
    id: string
    title: string
    location: string
    propertyType: string       // e.g. "Villa" | "Hotel" | "Guesthouse" | "Apartment"
    pricePerNight: number      // LKR — shown as "Starting from LKR X"
    maxGuests: number
    baseGuests: number
    extraGuestFee: number
    rating: number             // 0–5
    reviewCount: number        // shown as "(148 reviews)"
    badge?: "Superhost" | "Guest favorite"
    imageSrc: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
    return `LKR ${amount.toLocaleString("en-US")}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyCard({ listing }: { listing: PropertyListing }) {
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

                {/* ── Image ─────────────────────────────────────────────────── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--gray-5)]">
                    <Image
                        src={listing.imageSrc}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Badge */}
                    {listing.badge && (
                        <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[var(--bg)] text-[var(--fg)] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                            {listing.badge}
                        </span>
                    )}

                    {/* Wishlist */}
                    <button
                        id={`wishlist-${listing.id}`}
                        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setLiked(p => !p) }}
                        className={[
                            "absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center",
                            "transition-all duration-200 cursor-pointer",
                            liked
                                ? "bg-[var(--brand-primary)] text-[var(--white)] shadow-md"
                                : "bg-[var(--white)]/90 text-[var(--gray-2)] hover:bg-[var(--white)] hover:text-[var(--brand-primary)] shadow-sm",
                        ].join(" ")}
                    >
                        <Heart size={15} fill={liked ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────────────── */}
                <div className="p-3 sm:p-4 flex flex-col gap-1.5">

                    {/* Property type */}
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                        {listing.propertyType}
                    </span>

                    {/* Name + Rating on same row */}
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

                    {/* Review count & Guests */}
                    <p className="text-[11px] sm:text-[12px] text-[var(--muted)]">
                        {listing.reviewCount.toLocaleString()} reviews
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-[var(--muted)]">
                        Up to {listing.maxGuests} guest{listing.maxGuests !== 1 ? "s" : ""}
                    </p>

                    {/* Divider + Starting price */}
                    <div className="border-t border-[var(--border)] mt-1 pt-2">
                        <p className="text-[12px] sm:text-[13px] text-[var(--muted)]">
                            Starting from{" "}
                            <span className="text-[14px] sm:text-[15px] font-bold text-[var(--fg)]">
                                {formatLKR(listing.pricePerNight)}
                            </span>
                            <span className="text-[11px] sm:text-[12px] font-normal text-[var(--muted)]"> / night</span>
                        </p>
                    </div>

                </div>
            </article>
        </Link>
    )
}
