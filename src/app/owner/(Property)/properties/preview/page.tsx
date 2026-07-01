/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { reviewsApi } from "@/api/owner/reviews.api";
import { roomsApi } from "@/api/owner/rooms.api";
import { useAuthStore } from "@/store/auth/auth.store";
import Logo from "@/components/shared/branding/logo";
import {
    ArrowLeft,
    MapPin,
    Star,
    BedDouble,
    Users,
    Eye,
    Building2,
    Loader2,
    Bell,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyDto {
    id: number;
    name: string;
    description?: string;
    addressLine1?: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    mainImageUrl?: string;
    image?: string;
    status?: string;
    ownerId?: number;
}

interface RoomDto {
    id: number;
    name?: string;
    roomType?: string;
    type?: string;
    pricePerNight?: number;
    price?: number;
    maxOccupancy?: number;
    capacity?: number;
    status?: string;
}

interface ReviewResponse {
    id: number;
    guestId: number;
    bookingId: number;
    overallRating: number;
    cleanlinessRating: number;
    comfortRating: number;
    serviceRating: number;
    diningRating: number;
    locationRating: number;
    valueRating: number;
    comment: string;
    createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function StarRow({ rating, size = 15 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
                    color="#ffb401"
                    fill={n <= Math.round(rating) ? "#ffb401" : "none"}
                />
            ))}
        </span>
    );
}

function RatingBar({ label, value }: { label: string; value: number }) {
    const pct = Math.round((value / 5) * 100);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#4f4f4f", width: 90, flexShrink: 0 }}>{label}</span>
            <div
                style={{
                    flex: 1,
                    height: 6,
                    background: "#f0ebe5",
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "#953002",
                        borderRadius: 3,
                        transition: "width 0.5s ease",
                    }}
                />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#953002", width: 28, textAlign: "right" }}>
                {Number(value).toFixed(1)}
            </span>
        </div>
    );
}

// ── Inner Component ───────────────────────────────────────────────────────────

function PreviewContent() {
    const searchParams = useSearchParams();
    const propertyIdParam = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    const [property, setProperty] = useState<PropertyDto | null>(null);
    const [rooms, setRooms] = useState<RoomDto[]>([]);
    const [reviewSummary, setReviewSummary] = useState<{
        averageRating: number;
        totalReviews: number;
        avgCleanliness: number;
        avgComfort: number;
        avgService: number;
        avgDining: number;
        avgLocation: number;
        avgValue: number;
        recentReviews: ReviewResponse[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!propertyIdParam) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }

        const id = Number(propertyIdParam);

        Promise.all([
            propertiesApi.getProperty(id, ownerId),
            roomsApi.listRooms(undefined, undefined, 1, 50),
            reviewsApi.getPropertyReviews(id),
        ])
            .then(([propData, roomData, reviewData]) => {
                setProperty(propData);

                // Filter rooms by property — the API returns all rooms; filter by propertyId if present
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const allRooms: RoomDto[] = roomData.content ?? roomData.rooms ?? roomData ?? [];
                const filtered = allRooms.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (r: any) => !r.propertyId || r.propertyId === id
                );
                setRooms(filtered);

                setReviewSummary(reviewData);
            })
            .catch(() => setError("Failed to load property preview."))
            .finally(() => setLoading(false));
    }, [propertyIdParam, ownerId]);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#faf9f7",
                }}
            >
                <Loader2 size={32} color="#953002" style={{ animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div
                style={{
                    display: "flex",
                    height: "100vh",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#faf9f7",
                    gap: 16,
                }}
            >
                <Building2 size={48} color="#e0e0e0" />
                <div style={{ fontSize: 15, color: "#e74c3c", fontWeight: 600 }}>{error ?? "Property not found."}</div>
                <a
                    href="/owner/properties"
                    style={{
                        fontSize: 13,
                        color: "#953002",
                        textDecoration: "none",
                        fontWeight: 600,
                        border: "1px solid #953002",
                        padding: "8px 16px",
                        borderRadius: 8,
                    }}
                >
                    Back to Properties
                </a>
            </div>
        );
    }

    const heroImage = property.mainImageUrl ?? property.image ?? null;
    const location = [property.addressLine1 ?? property.address, property.city, property.country]
        .filter(Boolean)
        .join(", ");

    const recentReviews: ReviewResponse[] = reviewSummary?.recentReviews?.slice(0, 3) ?? [];

    const statusLabel =
        property.status === "active"
            ? "ACTIVE"
            : property.status === "inactive"
            ? "INACTIVE"
            : property.status?.toUpperCase() ?? "PENDING";

    const statusColor =
        property.status === "active"
            ? "#27ae60"
            : property.status === "inactive"
            ? "#828282"
            : "#e67e22";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#faf9f7",
                fontFamily: "sans-serif",
            }}
        >
            {/* ── Preview Banner ── */}
            <div
                style={{
                    background: "#fff8f0",
                    borderBottom: "2px solid #f0cdb4",
                    padding: "10px 0",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#953002",
                    letterSpacing: 0.3,
                }}
            >
                👁 Preview — This is how guests see your property
            </div>

            {/* ── Top Nav Bar ── */}
            <div
                style={{
                    background: "#fff",
                    borderBottom: "1px solid #e8e8e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Logo width={110} height={32} />
                    <div
                        style={{
                            width: 1,
                            height: 24,
                            background: "#e8e8e8",
                        }}
                    />
                    <a
                        href="/owner/properties"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#4f4f4f",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft size={15} color="#4f4f4f" />
                        Back to Properties
                    </a>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#953002",
                            background: "rgba(149,48,2,0.08)",
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: "1px solid rgba(149,48,2,0.2)",
                        }}
                    >
                        <Eye size={13} />
                        Preview Mode
                    </span>
                    <a
                        href="/owner/message"
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            textDecoration: "none",
                        }}
                    >
                        <Bell size={18} color="#4f4f4f" />
                    </a>
                    <a
                        href="/owner/profile"
                        style={{
                            display: "block",
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid #953002",
                        }}
                    >
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner"
                            alt=""
                            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                        />
                    </a>
                </div>
            </div>

            {/* ── Page Body ── */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>

                {/* ── Hero Image ── */}
                <div
                    style={{
                        width: "100%",
                        height: 340,
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "#f0ebe5",
                        marginBottom: 24,
                        position: "relative",
                    }}
                >
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={property.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                            }}
                        >
                            <Building2 size={52} color="#c0a898" />
                            <span style={{ fontSize: 13, color: "#b0b0b0" }}>No image available</span>
                        </div>
                    )}
                    {/* Status badge overlay */}
                    <span
                        style={{
                            position: "absolute",
                            top: 14,
                            right: 14,
                            background: statusColor,
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 1,
                            padding: "4px 10px",
                            borderRadius: 12,
                        }}
                    >
                        {statusLabel}
                    </span>
                </div>

                {/* ── Two-Column Layout ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

                    {/* ── Left Column ── */}
                    <div>
                        {/* Property Name & Location */}
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: "#1d1d1d",
                                margin: "0 0 6px",
                                lineHeight: 1.2,
                            }}
                        >
                            {property.name}
                        </h1>

                        {location && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    color: "#828282",
                                    fontSize: 13,
                                    marginBottom: 14,
                                }}
                            >
                                <MapPin size={14} color="#953002" />
                                {location}
                            </div>
                        )}

                        {/* Ratings summary inline */}
                        {reviewSummary && reviewSummary.totalReviews > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 18,
                                }}
                            >
                                <StarRow rating={reviewSummary.averageRating} size={16} />
                                <span style={{ fontSize: 16, fontWeight: 800, color: "#1d1d1d" }}>
                                    {reviewSummary.averageRating.toFixed(1)}
                                </span>
                                <span style={{ fontSize: 13, color: "#828282" }}>
                                    ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? "review" : "reviews"})
                                </span>
                            </div>
                        )}

                        {/* Description */}
                        {property.description && (
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e8e8e8",
                                    borderRadius: 12,
                                    padding: "18px 20px",
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#953002",
                                        marginBottom: 10,
                                    }}
                                >
                                    About this property
                                </div>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#4f4f4f",
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}
                                >
                                    {property.description}
                                </p>
                            </div>
                        )}

                        {/* ── Rooms Section ── */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 12,
                                padding: "18px 20px",
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 14,
                                }}
                            >
                                <BedDouble size={17} color="#953002" />
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d" }}>
                                    Available Rooms
                                </span>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#953002",
                                        background: "rgba(149,48,2,0.08)",
                                        padding: "2px 8px",
                                        borderRadius: 10,
                                    }}
                                >
                                    {rooms.length}
                                </span>
                            </div>

                            {rooms.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "28px 0",
                                        color: "#b0b0b0",
                                        fontSize: 13,
                                    }}
                                >
                                    No rooms listed for this property yet.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                        gap: 12,
                                    }}
                                >
                                    {rooms.map((room) => {
                                        const roomStatus = room.status ?? "available";
                                        const statusIsActive =
                                            roomStatus.toLowerCase() === "available" ||
                                            roomStatus.toLowerCase() === "active";
                                        const price = room.pricePerNight ?? room.price ?? 0;
                                        const occupancy = room.maxOccupancy ?? room.capacity ?? 0;
                                        const roomTypeName = room.roomType ?? room.type ?? "Room";

                                        return (
                                            <div
                                                key={room.id}
                                                style={{
                                                    border: "1px solid #e8e8e8",
                                                    borderRadius: 10,
                                                    padding: "14px 16px",
                                                    background: "#fafafa",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "#1d1d1d",
                                                                marginBottom: 2,
                                                            }}
                                                        >
                                                            {room.name ?? `Room ${room.id}`}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#828282" }}>
                                                            {roomTypeName}
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            fontWeight: 700,
                                                            color: "#fff",
                                                            background: statusIsActive ? "#27ae60" : "#828282",
                                                            padding: "2px 7px",
                                                            borderRadius: 6,
                                                            letterSpacing: 0.5,
                                                            textTransform: "uppercase" as const,
                                                        }}
                                                    >
                                                        {roomStatus}
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4,
                                                            fontSize: 12,
                                                            color: "#828282",
                                                        }}
                                                    >
                                                        <Users size={12} />
                                                        {occupancy} guests
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 800,
                                                            color: "#953002",
                                                        }}
                                                    >
                                                        ${price}
                                                        <span
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: 500,
                                                                color: "#b0b0b0",
                                                            }}
                                                        >
                                                            /night
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── Recent Reviews ── */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 12,
                                padding: "18px 20px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 14,
                                }}
                            >
                                <Star size={17} color="#ffb401" fill="#ffb401" />
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1d" }}>
                                    Recent Reviews
                                </span>
                            </div>

                            {recentReviews.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "28px 0",
                                        color: "#b0b0b0",
                                        fontSize: 13,
                                    }}
                                >
                                    No reviews yet for this property.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {recentReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            style={{
                                                borderBottom: "1px solid #f5f5f5",
                                                paddingBottom: 14,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    {/* Guest Avatar */}
                                                    <div
                                                        style={{
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: "50%",
                                                            background: "#953002",
                                                            color: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 700,
                                                            fontSize: 12,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {`G${review.guestId}`.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: "#1d1d1d",
                                                            }}
                                                        >
                                                            Guest #{review.guestId}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#b0b0b0" }}>
                                                            {formatDate(review.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StarRow rating={review.overallRating} size={13} />
                                            </div>

                                            {review.comment && (
                                                <p
                                                    style={{
                                                        fontSize: 13,
                                                        color: "#4f4f4f",
                                                        lineHeight: 1.6,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Ratings Breakdown Card */}
                        {reviewSummary && reviewSummary.totalReviews > 0 && (
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e8e8e8",
                                    borderRadius: 12,
                                    padding: "18px 20px",
                                }}
                            >
                                <div style={{ marginBottom: 14 }}>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#953002",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Guest Ratings
                                    </div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                        <span style={{ fontSize: 36, fontWeight: 900, color: "#1d1d1d" }}>
                                            {reviewSummary.averageRating.toFixed(1)}
                                        </span>
                                        <span style={{ fontSize: 13, color: "#828282" }}>/ 5.0</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                                        <StarRow rating={reviewSummary.averageRating} />
                                        <span style={{ fontSize: 12, color: "#828282" }}>
                                            {reviewSummary.totalReviews} reviews
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    {reviewSummary.avgCleanliness != null && (
                                        <RatingBar label="Cleanliness" value={reviewSummary.avgCleanliness} />
                                    )}
                                    {reviewSummary.avgComfort != null && (
                                        <RatingBar label="Comfort" value={reviewSummary.avgComfort} />
                                    )}
                                    {reviewSummary.avgService != null && (
                                        <RatingBar label="Service" value={reviewSummary.avgService} />
                                    )}
                                    {reviewSummary.avgDining != null && (
                                        <RatingBar label="Dining" value={reviewSummary.avgDining} />
                                    )}
                                    {reviewSummary.avgLocation != null && (
                                        <RatingBar label="Location" value={reviewSummary.avgLocation} />
                                    )}
                                    {reviewSummary.avgValue != null && (
                                        <RatingBar label="Value" value={reviewSummary.avgValue} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Info Card */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 12,
                                padding: "18px 20px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#953002",
                                    marginBottom: 12,
                                }}
                            >
                                Quick Info
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingBottom: 10,
                                    borderBottom: "1px solid #f5f5f5",
                                    marginBottom: 10,
                                }}
                            >
                                <span style={{ fontSize: 13, color: "#4f4f4f" }}>Total Rooms</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#953002" }}>{rooms.length}</span>
                            </div>

                            {location && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "flex-start",
                                        paddingBottom: 10,
                                        borderBottom: "1px solid #f5f5f5",
                                        marginBottom: 10,
                                    }}
                                >
                                    <MapPin size={14} color="#953002" style={{ marginTop: 1, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: "#4f4f4f", lineHeight: 1.5 }}>{location}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13, color: "#4f4f4f" }}>Status</span>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#fff",
                                        background: statusColor,
                                        padding: "3px 9px",
                                        borderRadius: 8,
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {statusLabel}
                                </span>
                            </div>
                        </div>

                        {/* Edit CTA */}
                        <a
                            href={`/owner/properties/editPropertyDetails?id=${property.id}`}
                            style={{ textDecoration: "none" }}
                        >
                            <button
                                style={{
                                    width: "100%",
                                    padding: "12px 0",
                                    background: "#953002",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    letterSpacing: 0.3,
                                }}
                            >
                                Edit This Property
                            </button>
                        </a>

                        <a
                            href={`/owner/properties/propertyDetails?id=${property.id}`}
                            style={{ textDecoration: "none" }}
                        >
                            <button
                                style={{
                                    width: "100%",
                                    padding: "11px 0",
                                    background: "transparent",
                                    color: "#953002",
                                    border: "1px solid #953002",
                                    borderRadius: 10,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Back to Property Details
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Page Export ───────────────────────────────────────────────────────────────

export default function PropertyPreviewPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: "flex",
                        height: "100vh",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#faf9f7",
                    }}
                >
                    <Loader2 size={28} color="#953002" />
                </div>
            }
        >
            <PreviewContent />
        </Suspense>
    );
}
