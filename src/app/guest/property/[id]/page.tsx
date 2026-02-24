import { notFound } from "next/navigation"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyDetailPage from "@/components/features/guest/property/property-detail-page"
import { getPropertyById, ALL_PROPERTIES } from "@/lib/mock-properties"

interface Props {
    params: Promise<{ id: string }>
}

export async function generateStaticParams() {
    return ALL_PROPERTIES.map(p => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params
    const property = getPropertyById(id)
    if (!property) return {}
    return {
        title: `${property.title} — Prime Stay Sri Lanka`,
        description: `${property.description.slice(0, 155)}…`,
    }
}

export default async function PropertyPage({ params }: Props) {
    const { id } = await params
    const property = getPropertyById(id)
    if (!property) notFound()

    return (
        <>
            <GuestTopbar />
            <main>
                <PropertyDetailPage property={property} />
            </main>
            <GuestFooter />
        </>
    )
}
