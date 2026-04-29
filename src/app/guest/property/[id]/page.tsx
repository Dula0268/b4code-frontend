import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyDetailPage from "@/components/features/guest/property/property-detail-page"
import { getPropertyById } from "@/lib/mock-properties"

interface Props {
    params: { id: string }
}

async function fetchProperty(id: string) {
    try {
        const res = await fetch(`http://localhost:8080/api/guest/properties/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Not found");
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch property, using mock data", error);
        return getPropertyById(id);
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
