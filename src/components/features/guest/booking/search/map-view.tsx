"use client"

import { useEffect, useRef } from "react"
import type { LatLngBoundsExpression, Map as LeafletMap, Marker } from "leaflet"
import type { PropertyListing } from "./property-card"

// ─── Sri Lanka coordinates for each location ──────────────────────────────
const LOCATION_COORDS: Record<string, [number, number]> = {
    "Colombo": [6.9271, 79.8612],
    "Galle": [6.0535, 80.2210],
    "Kandy": [7.2906, 80.6337],
    "Negombo": [7.2086, 79.8358],
    "Mirissa": [5.9469, 80.4571],
    "Ella": [6.8667, 81.0500],
    "Nuwara Eliya": [6.9497, 80.7891],
    "Trincomalee": [8.5874, 81.2152],
    "Arugam Bay": [6.8397, 81.8360],
    "Sigiriya": [7.9570, 80.7603],
    "Bentota": [6.4268, 79.9967],
    "Hikkaduwa": [6.1395, 80.1024],
    "Unawatuna": [6.0097, 80.2497],
    "Jaffna": [9.6615, 80.0255],
    "Polonnaruwa": [7.9394, 81.0003],
}

function getCoords(location: string): [number, number] {
    return LOCATION_COORDS[location] ?? [7.8731, 80.7718] // Sri Lanka center
}

function formatLKR(v: number) {
    if (v >= 100_000) return `LKR ${(v / 1000).toFixed(0)}K`
    return `LKR ${(v / 1000).toFixed(0)}K`
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapViewProps {
    listings: PropertyListing[]
    hoveredId?: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────
// We dynamically import Leaflet inside useEffect to avoid SSR issues.
export default function MapView({ listings, hoveredId }: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<LeafletMap | null>(null)
    const markersRef = useRef<Map<string, Marker>>(new Map())

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        // Dynamic import of leaflet (client-side only)
        import("leaflet").then(L => {
            // Fix default icon paths broken by webpack
            // @ts-expect-error – Leaflet internal property not in types
            delete L.Icon.Default.prototype._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            })

            // Create map centered on Sri Lanka
            const map = L.map(containerRef.current!, {
                center: [7.8731, 80.7718],
                zoom: 7,
                zoomControl: true,
                scrollWheelZoom: true,
            })

            // OpenStreetMap tile layer — free, no API key
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map)

            // Add a marker for each listing
            listings.forEach(listing => {
                const [lat, lng] = getCoords(listing.location)

                // Price-label marker (custom DivIcon)
                const icon = L.divIcon({
                    className: "",
                    html: `
            <div style="
              background: #953002;
              color: white;
              font-size: 11px;
              font-weight: 700;
              font-family: Inter, sans-serif;
              padding: 4px 8px;
              border-radius: 20px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              border: 2px solid white;
              cursor: pointer;
              transition: transform 0.15s;
            ">${formatLKR(listing.pricePerNight)}</div>
          `,
                    iconAnchor: [40, 16],
                    popupAnchor: [0, -20],
                })

                const marker = L.marker([lat, lng], { icon })

                // Popup with property details
                marker.bindPopup(`
          <div style="
            font-family: Inter, sans-serif;
            min-width: 200px;
            max-width: 220px;
          ">
            <img
              src="${listing.imageSrc}"
              alt="${listing.title}"
              style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
              onerror="this.style.display='none'"
            />
            <p style="font-size:13px;font-weight:700;color:#1d1d1d;margin:0 0 2px 0;line-height:1.3;">${listing.title}</p>
            <p style="font-size:11px;color:#828282;margin:0 0 6px 0;">${listing.propertyType} · ${listing.reviewCount} reviews</p>
            <p style="font-size:13px;font-weight:700;color:#953002;margin:0;">${formatLKR(listing.pricePerNight)} <span style="font-weight:400;color:#828282;font-size:11px;">/ night</span></p>
            ${listing.rating ? `<p style="font-size:11px;color:#ffb401;margin:4px 0 0 0;">★ ${listing.rating.toFixed(2)}</p>` : ""}
          </div>
        `, { maxWidth: 230 })

                marker.addTo(map)
                markersRef.current.set(listing.id, marker as Marker)
            })

            // Fit map to all markers
            if (listings.length > 0) {
                const bounds = listings.map(l => getCoords(l.location))
                map.fitBounds(bounds as LatLngBoundsExpression, { padding: [40, 40], maxZoom: 10 })
            }

            mapRef.current = map
        })

        return () => {
            const markers = markersRef.current
            mapRef.current?.remove()
            mapRef.current = null
            markers.clear()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Highlight hovered marker
    useEffect(() => {
        if (!mapRef.current) return
        import("leaflet").then(L => {
            markersRef.current.forEach((marker, id) => {
                const listing = listings.find(l => l.id === id)
                if (!listing) return
                const isHovered = id === hoveredId
                const icon = L.divIcon({
                    className: "",
                    html: `
            <div style="
              background: ${isHovered ? "#1d1d1d" : "#953002"};
              color: white;
              font-size: 11px;
              font-weight: 700;
              font-family: Inter, sans-serif;
              padding: 4px 8px;
              border-radius: 20px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
              cursor: pointer;
              transform: ${isHovered ? "scale(1.15)" : "scale(1)"};
              transition: transform 0.15s;
              z-index: ${isHovered ? 1000 : 1};
            ">${formatLKR(listing.pricePerNight)}</div>
          `,
                    iconAnchor: [40, 16],
                    popupAnchor: [0, -20],
                })
                marker.setIcon(icon)
            })
        })
    }, [hoveredId, listings])

    return (
        <>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <div
                ref={containerRef}
                className="w-full h-full rounded-xl overflow-hidden"
                style={{ minHeight: "500px" }}
            />
        </>
    )
}
