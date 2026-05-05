import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyDetailPage from "@/components/features/guest/property/property-detail-page"
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

function mergePropertyDetails(fallback: PropertyDetail, backend: Awaited<ReturnType<typeof guestApi.getPropertyDetail>>): PropertyDetail {
    const backendRooms = Array.isArray((backend as { rooms?: BackendRoom[] }).rooms)
        ? (backend as { rooms?: BackendRoom[] }).rooms ?? []
        : []

    return {
        ...fallback,
        id: String(backend.id ?? fallback.id),
        title: backend.title ?? fallback.title,
        location: backend.location ?? fallback.location,
        fullAddress: backend.fullAddress ?? fallback.fullAddress,
        propertyType: backend.propertyType ?? fallback.propertyType,
        pricePerNight: backend.pricePerNight ?? fallback.pricePerNight,
        rating: backend.rating ?? fallback.rating,
        reviewCount: backend.reviewCount ?? fallback.reviewCount,
        badge: backend.badge ?? fallback.badge,
        imageSrc: backend.imageSrc ?? fallback.imageSrc,
        galleryImages: backend.galleryImages?.length ? backend.galleryImages : fallback.galleryImages,
        description: backend.description ?? fallback.description,
        amenities: backend.amenities?.length ? backend.amenities : fallback.amenities,
        reviewBreakdown: backend.reviewBreakdown?.length ? backend.reviewBreakdown : fallback.reviewBreakdown,
        reviews: backend.reviews?.length ? backend.reviews : fallback.reviews,
        rooms: backendRooms.length > 0
            ? backendRooms.map((room, index) => mapBackendRoom(room, fallback.rooms[index] ?? fallback.rooms[0]))
            : fallback.rooms,
        lat: backend.lat ?? fallback.lat,
        lng: backend.lng ?? fallback.lng,
    }
}

async function fetchProperty(id: string) {
    const fallback = getPropertyById(id)
    if (!fallback) return null

    try {
        const backend = await guestApi.getPropertyDetail(id)
        return mergePropertyDetails(fallback, backend)
    } catch {
        return fallback
    }
}

export async function generateMetadata({ params }: Props) {
    const { id } = params
    const property = await fetchProperty(id)
    if (!property) return {}
    return {
        title: `${property.title} — Prime Stay Sri Lanka`,
        description: property.description ? `${property.description.slice(0, 155)}…` : '',
    }
}

export default async function PropertyPage({ params }: Props) {
    const { id } = params
    const property = await fetchProperty(id)
    if (!property) notFound()

    return (
        <>
            <GuestTopbar />
            <main>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading property details...</div>}>
                    <PropertyDetailPage property={property} />
                </Suspense>
            </main>
            <GuestFooter />
        </>
    )
}
