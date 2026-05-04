import { notFound } from "next/navigation"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import RoomDetailPage from "@/components/features/guest/property/room-detail-page"

interface Props {
    params: { id: string; roomId: string }
}

type PropertyRoom = { id: string; name?: string; pricePerNight?: number }
type PropertyApi = {
  title?: string
  rooms?: PropertyRoom[]
}

async function fetchProperty(id: string) {
    try {
        const res = await fetch(`http://localhost:8080/api/guest/properties/${id}`, { cache: "no-store" });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Failed to fetch property");
        }
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch property", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props) {
    const { id, roomId } = params
    const property = (await fetchProperty(id)) as PropertyApi | null
    if (!property) return {}
    const room = property.rooms?.find((r) => r.id === roomId)
    if (!room) return {}
    return {
        title: `${room.name} · ${property.title} — Prime Stay Sri Lanka`,
        description: `Book the ${room.name} at ${property.title}. Starting from LKR ${room.pricePerNight} per night.`,
    }
}

export default async function RoomPage({ params }: Props) {
    const { id, roomId } = params
    const property = (await fetchProperty(id)) as PropertyApi | null
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
