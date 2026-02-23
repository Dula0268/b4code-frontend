"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"

// ─── Type ─────────────────────────────────────────────────────────────────────
export interface PropertyListing {
    id: string
    title: string
    location: string
    propertyType: string       // e.g. "Villa" | "Hotel" | "Guesthouse" | "Apartment"
    pricePerNight: number      // LKR — shown as "Starting from LKR X"
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

    return (
        <Link
            href={`/guest/property/${listing.id}`}
            className="group block no-underline text-inherit"
            aria-label={`View ${listing.title}`}
        >
            <article className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-0.5">

                {/* ── Image ─────────────────────────────────────────────────── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3ede8]">
                    <Image
                        src={listing.imageSrc}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Badge */}
                    {listing.badge && (
                        <span className="absolute top-3 left-3 bg-white text-[#1d1d1d] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            {listing.badge}
                        </span>
                    )}

                    {/* Wishlist */}
                    <button
                        id={`wishlist-${listing.id}`}
                        aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setLiked(p => !p) }}
                        className={[
                            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                            "transition-all duration-200 cursor-pointer",
                            liked
                                ? "bg-[#953002] text-white shadow-md"
                                : "bg-white/80 text-[#333] hover:bg-white hover:text-[#953002] shadow-sm",
                        ].join(" ")}
                    >
                        <Heart size={15} fill={liked ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────────────── */}
                <div className="p-4 flex flex-col gap-1.5">

                    {/* Property type */}
                    <span className="text-[11px] font-semibold text-[#953002] uppercase tracking-wider">
                        {listing.propertyType}
                    </span>

                    {/* Name + Rating on same row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3
                            className="text-[15px] font-semibold text-[#1d1d1d] leading-snug line-clamp-1"
                            style={{ fontSize: "15px", lineHeight: "1.3", fontWeight: 600, color: "#1d1d1d" }}
                        >
                            {listing.title}
                        </h3>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star size={12} className="text-[#ffb401]" fill="#ffb401" />
                            <span className="text-[13px] font-semibold text-[#1d1d1d]">
                                {listing.rating.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Review count */}
                    <p className="text-[12px] text-[#828282]">
                        {listing.reviewCount.toLocaleString()} reviews
                    </p>

                    {/* Divider + Starting price */}
                    <div className="border-t border-[#f0f0f0] mt-1 pt-2">
                        <p className="text-[13px] text-[#828282]">
                            Starting from{" "}
                            <span className="text-[15px] font-bold text-[#1d1d1d]">
                                {formatLKR(listing.pricePerNight)}
                            </span>
                            <span className="text-[12px] font-normal text-[#828282]"> / night</span>
                        </p>
                    </div>

                </div>
            </article>
        </Link>
    )
}
