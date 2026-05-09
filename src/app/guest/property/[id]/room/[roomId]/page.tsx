import { notFound } from "next/navigation"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import RoomPageClient from "./page-client"
import type { PropertyDetail } from "@/lib/mock-properties"
import { getPropertyById } from "@/lib/mock-properties"

interface Props {
    params: { id: string; roomId: string }
}

import { fetchProperty } from "../../page"

export async function generateMetadata({ params }: Props) {
    const { id, roomId } = params
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
    const { id, roomId } = params
    const property = await fetchProperty(id)
    if (!property) notFound()
    const room = property.rooms?.find((r) => r.id === roomId)
    if (!room) notFound()

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1">
                <RoomPageClient property={property} room={room} />
            </main>
            <GuestFooter variant="full" />
        </div>
    )
}
