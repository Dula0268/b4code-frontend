import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyClient from "./page-client"
import { guestApi } from "@/lib/api"
import { getPropertyById, type PropertyDetail, type Room } from "@/lib/mock-properties"

interface Props {
    params: { id: string }
}

type BackendRoom = {
    id?: number | string
    roomId?: number | string
    name?: string
    roomType?: string
    maxGuests?: number
    maxOccupancy?: number
    pricePerNight?: number
    amenities?: string
    imageSrc?: string
    imageUrl?: string
}

type BackendPropertyDetail = {
    [key: string]: unknown
    id?: string | number
    rooms?: unknown
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === "string")
}

function isBackendRoomArray(value: unknown): value is BackendRoom[] {
    return Array.isArray(value) && value.every(item => typeof item === "object" && item !== null)
}

function mapBackendRoom(room: BackendRoom, fallback?: Room): Room {
    return {
        id: String(room.id ?? room.roomId ?? fallback?.id ?? ""),
        name: room.name ?? fallback?.name ?? "Room",
        maxGuests: Number(room.maxGuests ?? room.maxOccupancy ?? fallback?.maxGuests ?? 2),
        bedType: fallback?.bedType ?? room.roomType ?? "1 Bed",
        sqft: fallback?.sqft ?? 0,
        pricePerNight: Number(room.pricePerNight ?? fallback?.pricePerNight ?? 0),
        originalPrice: fallback?.originalPrice,
        tag: fallback?.tag,
        features: fallback?.features ?? (room.amenities ? room.amenities.split(",").map(part => part.trim()).filter(Boolean) : []),
        imageSrc: room.imageSrc ?? room.imageUrl ?? fallback?.imageSrc ?? "/images/rooms/room-ocean-king.jpg",
    }
}

function mergePropertyDetails(fallback: PropertyDetail, backend: BackendPropertyDetail): PropertyDetail {
    const backendRooms = isBackendRoomArray(backend.rooms) ? backend.rooms : []
    const title = typeof backend.title === "string" ? backend.title : fallback.title
    const location = typeof backend.location === "string" ? backend.location : fallback.location
    const fullAddress = typeof backend.fullAddress === "string" ? backend.fullAddress : fallback.fullAddress
    const propertyType = typeof backend.propertyType === "string" ? backend.propertyType : fallback.propertyType
    const pricePerNight = typeof backend.pricePerNight === "number" ? backend.pricePerNight : fallback.pricePerNight
    const rating = typeof backend.rating === "number" ? backend.rating : fallback.rating
    const reviewCount = typeof backend.reviewCount === "number" ? backend.reviewCount : fallback.reviewCount
    const badge = backend.badge === "Superhost" || backend.badge === "Guest favorite" ? backend.badge : fallback.badge
    const imageSrc = typeof backend.imageSrc === "string" ? backend.imageSrc : fallback.imageSrc
    const galleryImages = isStringArray(backend.galleryImages) && backend.galleryImages.length > 0 ? backend.galleryImages : fallback.galleryImages
    const description = typeof backend.description === "string" ? backend.description : fallback.description
    const amenities = Array.isArray(backend.amenities) && backend.amenities.length > 0 ? backend.amenities : fallback.amenities
    const reviewBreakdown = Array.isArray(backend.reviewBreakdown) && backend.reviewBreakdown.length > 0 ? backend.reviewBreakdown : fallback.reviewBreakdown
    const reviews = Array.isArray(backend.reviews) && backend.reviews.length > 0 ? backend.reviews : fallback.reviews
    const lat = typeof backend.lat === "number" ? backend.lat : fallback.lat
    const lng = typeof backend.lng === "number" ? backend.lng : fallback.lng

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
        rooms: backendRooms.length > 0
            ? backendRooms.map((room, index) => mapBackendRoom(room, fallback.rooms[index] ?? fallback.rooms[0]))
            : fallback.rooms,
        lat,
        lng,
    }
}

export async function fetchProperty(id: string) {
    const fallback = getPropertyById(id)
    if (!fallback) return null

    try {
        const backend = await guestApi.getPropertyDetail(id) as BackendPropertyDetail
        return mergePropertyDetails(fallback, backend)
    } catch {
        return fallback
    }
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params
    const property = await fetchProperty(id)
    if (!property) return {}
    return {
        title: `${property.title} — Prime Stay Sri Lanka`,
        description: property.description ? `${property.description.slice(0, 155)}…` : '',
    }
}

export default async function PropertyPage({ params }: Props) {
    const { id } = await params
    const property = await fetchProperty(id)
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
