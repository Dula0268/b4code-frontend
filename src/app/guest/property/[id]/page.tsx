import { notFound } from "next/navigation"
import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import PropertyClient from "@/components/guest/property/property-detail-client"
import { guestApi } from "@/api/guest/guest.api";

interface Props {
    params: Promise<{ id: string }>
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

async function fetchProperty(id: string, checkIn?: string, checkOut?: string) {
    try {
        const backend = await guestApi.getPropertyDetail(id, checkIn, checkOut)
        
        // Ensure images exist to avoid breaking UI
        if (!backend.imageSrc || typeof backend.imageSrc !== "string" || backend.imageSrc.trim() === "") {
            backend.imageSrc = "/images/placeholder-property.jpg";
        }
        if (!backend.galleryImages || backend.galleryImages.length === 0) {
            backend.galleryImages = [backend.imageSrc];
        }

        return backend
    } catch (err) {
        console.error("fetchProperty error:", err);
        return null
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
        description: property.description && typeof property.description === 'string' ? `${property.description.slice(0, 155)}…` : '',
    }
}

export default async function PropertyPage({ params, searchParams }: Props) {
    const { id } = await params
    const resolvedSearchParams = await searchParams;
    
    // Default to tomorrow and day-after if dates are not provided in URL
    const checkIn = (resolvedSearchParams?.checkIn as string | undefined) || (() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
    })();
    const checkOut = (resolvedSearchParams?.checkOut as string | undefined) || (() => {
        const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0];
    })();
    
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
