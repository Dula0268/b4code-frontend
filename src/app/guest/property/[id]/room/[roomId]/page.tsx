import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import RoomPageClient from "@/components/features/guest/property/room/room-detail-client"
import { guestApi } from "@/lib/api"
import { getPropertyById, type PropertyDetail, type Room } from "@/lib/mock-properties"

interface Props {
    params: Promise<{ id: string; roomId: string }>
}

// ── Same types & helpers as the property page ──────────────────────────────
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
        features: fallback?.features ?? (room.amenities ? room.amenities.split(",").map(p => p.trim()).filter(Boolean) : []),
        imageSrc: room.imageSrc ?? room.imageUrl ?? fallback?.imageSrc ?? "/images/rooms/room-ocean-king.jpg",
    }
}

function mergePropertyDetails(fallback: PropertyDetail, backend: BackendPropertyDetail): PropertyDetail {
    const backendRooms = isBackendRoomArray(backend.rooms) ? backend.rooms : []
    return {
        ...fallback,
        id: String(backend.id ?? fallback.id),
        title: typeof backend.title === "string" ? backend.title : fallback.title,
        location: typeof backend.location === "string" ? backend.location : fallback.location,
        fullAddress: typeof backend.fullAddress === "string" ? backend.fullAddress : fallback.fullAddress,
        propertyType: typeof backend.propertyType === "string" ? backend.propertyType : fallback.propertyType,
        pricePerNight: typeof backend.pricePerNight === "number" ? backend.pricePerNight : fallback.pricePerNight,
        rating: typeof backend.rating === "number" ? backend.rating : fallback.rating,
        reviewCount: typeof backend.reviewCount === "number" ? backend.reviewCount : fallback.reviewCount,
        badge: backend.badge === "Superhost" || backend.badge === "Guest favorite" ? backend.badge : fallback.badge,
        imageSrc: typeof backend.imageSrc === "string" ? backend.imageSrc : fallback.imageSrc,
        galleryImages: isStringArray(backend.galleryImages) && (backend.galleryImages as string[]).length > 0 ? backend.galleryImages as string[] : fallback.galleryImages,
        description: typeof backend.description === "string" ? backend.description : fallback.description,
        amenities: Array.isArray(backend.amenities) && (backend.amenities as unknown[]).length > 0 ? backend.amenities as PropertyDetail["amenities"] : fallback.amenities,
        reviewBreakdown: Array.isArray(backend.reviewBreakdown) ? backend.reviewBreakdown as PropertyDetail["reviewBreakdown"] : fallback.reviewBreakdown,
        reviews: Array.isArray(backend.reviews) ? backend.reviews as PropertyDetail["reviews"] : fallback.reviews,
        lat: typeof backend.lat === "number" ? backend.lat : fallback.lat,
        lng: typeof backend.lng === "number" ? backend.lng : fallback.lng,
        rooms: backendRooms.length > 0
            ? backendRooms.map((room, index) => mapBackendRoom(room, fallback.rooms[index] ?? fallback.rooms[0]))
            : fallback.rooms,
    }
}

async function fetchProperty(id: string): Promise<PropertyDetail | null> {
    const fallback = getPropertyById(id)
    if (!fallback) return null
    try {
        const backend = await guestApi.getPropertyDetail(id) as BackendPropertyDetail
        return mergePropertyDetails(fallback, backend)
    } catch {
        return fallback
    }
}

// ── Find room: match by exact id OR numeric backend id ────────────────────
function findRoom(property: PropertyDetail, roomId: string): Room | undefined {
    return property.rooms?.find(r => String(r.id) === roomId)
}

// ── Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
    const { id, roomId } = await params
    const property = await fetchProperty(id)
    if (!property) return {}
    const room = findRoom(property, roomId)
    if (!room) return {}
    return {
        title: `${room.name} · ${property.title} — Prime Stay Sri Lanka`,
        description: `Book the ${room.name} at ${property.title}. Starting from LKR ${room.pricePerNight} per night.`,
    }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function RoomPage({ params }: Props) {
    const { id, roomId } = await params
    const property = await fetchProperty(id)
    if (!property) notFound()
    const room = findRoom(property, roomId)
    if (!room) notFound()

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1">
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
                    </div>
                }>
                    <RoomPageClient property={property} room={room} />
                </Suspense>
            </main>
            <GuestFooter variant="full" />
        </div>
    )
}
