import { notFound } from "next/navigation"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import RoomDetailPage from "@/components/features/guest/property/room-detail-page"
import { getPropertyById, ALL_PROPERTIES } from "@/lib/mock-properties"

interface Props {
    params: Promise<{ id: string; roomId: string }>
}

export async function generateStaticParams() {
    const params: { id: string; roomId: string }[] = []
    ALL_PROPERTIES.forEach(p => {
        p.rooms.forEach(r => {
            params.push({ id: p.id, roomId: r.id })
        })
    })
    return params
}

export async function generateMetadata({ params }: Props) {
    const { id, roomId } = await params
    const property = getPropertyById(id)
    if (!property) return {}
    const room = property.rooms.find(r => r.id === roomId)
    if (!room) return {}
    return {
        title: `${room.name} · ${property.title} — Prime Stay Sri Lanka`,
        description: `Book the ${room.name} at ${property.title}. Starting from LKR ${room.pricePerNight} per night.`,
    }
}

export default async function RoomPage({ params }: Props) {
    const { id, roomId } = await params
    const property = getPropertyById(id)
    if (!property) notFound()
    const room = property.rooms.find(r => r.id === roomId)
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
