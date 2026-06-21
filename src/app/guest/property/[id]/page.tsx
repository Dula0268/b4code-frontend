import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyClient from "@/components/guest/property/property-detail-client"
import { guestApi } from "@/api/guest/guest.api";
import { getPropertyById, type PropertyDetail, type Room } from "@/lib/mock-properties"

interface Props {
    params: Promise<{ id: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Removed manual room mapping since guestApi already normalizes it

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === "string")
}

function mergePropertyDetails(fallback: PropertyDetail, backend: any): PropertyDetail {
    const title = typeof backend.title === "string" ? backend.title : fallback.title
    const location = typeof backend.location === "string" ? backend.location : fallback.location
    const fullAddress = typeof backend.fullAddress === "string" ? backend.fullAddress : fallback.fullAddress
    const propertyType = typeof backend.propertyType === "string" ? backend.propertyType : fallback.propertyType
    const pricePerNight = typeof backend.pricePerNight === "number" ? backend.pricePerNight : fallback.pricePerNight
    const rating = typeof backend.rating === "number" ? backend.rating : fallback.rating
    const reviewCount = typeof backend.reviewCount === "number" ? backend.reviewCount : fallback.reviewCount
    const badge = backend.badge === "Superhost" || backend.badge === "Guest favorite" ? backend.badge : fallback.badge
    const imageSrc = typeof backend.imageSrc === "string" && backend.imageSrc.trim() !== "" ? backend.imageSrc : "/images/placeholder-property.jpg"
    const galleryImages = Array.isArray(backend.galleryImages) ? backend.galleryImages : []
    const description = typeof backend.description === "string" ? backend.description : fallback.description
    const amenities = Array.isArray(backend.amenities) && backend.amenities.length > 0 ? backend.amenities : fallback.amenities
    const reviewBreakdown = Array.isArray(backend.reviewBreakdown) && backend.reviewBreakdown.length > 0 ? backend.reviewBreakdown : fallback.reviewBreakdown
    const reviews = Array.isArray(backend.reviews) && backend.reviews.length > 0 ? backend.reviews : fallback.reviews
    const lat = typeof backend.lat === "number" ? backend.lat : fallback.lat
    const lng = typeof backend.lng === "number" ? backend.lng : fallback.lng

    const checkInTime = typeof backend.checkInTime === "string" ? backend.checkInTime : fallback.checkInTime
    const checkOutTime = typeof backend.checkOutTime === "string" ? backend.checkOutTime : fallback.checkOutTime
    const cancellationPolicy = typeof backend.cancellationPolicy === "string" ? backend.cancellationPolicy : fallback.cancellationPolicy
    const childPolicy = typeof backend.childPolicy === "string" ? backend.childPolicy : fallback.childPolicy
    const houseRules = typeof backend.houseRules === "string" ? backend.houseRules : fallback.houseRules

    return {
        ...fallback,
        id: String(backend.id ?? fallback.id),
        title,
        location,
        fullAddress,
        propertyType,
        pricePerNight,
        rating,
        reviewCount,
        badge,
        imageSrc,
        galleryImages,
        description,
        amenities,
        reviewBreakdown,
        reviews,
        rooms: Array.isArray(backend.rooms) ? backend.rooms : fallback.rooms,
        lat,
        lng,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        childPolicy,
        houseRules
    }
}

async function fetchProperty(id: string, checkIn?: string, checkOut?: string) {
    const fallback = getPropertyById(id)
    if (!fallback) return null

    try {
        const backend = await guestApi.getPropertyDetail(id, checkIn, checkOut)
        return mergePropertyDetails(fallback, backend)
    } catch {
        return fallback
    }
}

export async function generateMetadata({ params, searchParams }: Props) {
    const { id } = await params
    const resolvedSearchParams = await searchParams;
    const checkIn = resolvedSearchParams?.checkIn as string | undefined;
    const checkOut = resolvedSearchParams?.checkOut as string | undefined;
    const property = await fetchProperty(id, checkIn, checkOut)
    if (!property) return {}
    return {
        title: `${property.title} — Prime Stay Sri Lanka`,
        description: property.description ? `${property.description.slice(0, 155)}…` : '',
    }
}

export default async function PropertyPage({ params, searchParams }: Props) {
    const { id } = await params
    const resolvedSearchParams = await searchParams;
    const checkIn = resolvedSearchParams?.checkIn as string | undefined;
    const checkOut = resolvedSearchParams?.checkOut as string | undefined;
    const property = await fetchProperty(id, checkIn, checkOut)
    if (!property) notFound()

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1">
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
                    </div>
                }>
                    <PropertyClient property={property} />
                </Suspense>
            </main>
            <GuestFooter variant="full" />
        </div>
    )
}
