import { notFound } from "next/navigation"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import RoomDetailPage from "@/components/features/guest/property/room-detail-page"
import { ALL_PROPERTIES, type PropertyDetail } from "@/lib/mock-properties"

interface Props {
    params: Promise<{ id: string; roomId: string }>
}

async function fetchProperty(id: string): Promise<PropertyDetail | null> {
    try {
        const res = await fetch(`http://localhost:8080/api/guest/properties/${id}`, { cache: "no-store" });
        if (!res.ok) {
            // Fallback to mock data if backend fails
            return ALL_PROPERTIES.find(p => p.id === id) || null;
        }
        return (await res.json()) as PropertyDetail;
    } catch (error) {
        console.error("Failed to fetch property, using mock fallback", error);
        return ALL_PROPERTIES.find(p => p.id === id) || null;
    }
}

export async function generateMetadata({ params }: Props) {
    const { id, roomId } = await params
    const property = await fetchProperty(id)
    if (!property) return {}
    const room = property.rooms?.find((r) => r.id === roomId)
    if (!room) return {}
    return {
        title: `${room.name} · ${property.title} — Prime Stay Sri Lanka`,
        description: `Book the ${room.name} at ${property.title}. Starting from LKR ${room.pricePerNight} per night.`,
    }
}

export default async function RoomPage({ params }: Props) {
    const { id, roomId } = await params
    const property = await fetchProperty(id)
    if (!property) notFound()
    
    const room = property.rooms?.find((r) => r.id === roomId)
    if (!room) notFound()

    return (
        <>
            <GuestTopbar />
            <main>
                <RoomDetailPage property={property} room={room} />
            </main>
            <GuestFooter />
        </>
    )
}
