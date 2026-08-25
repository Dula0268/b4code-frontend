/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { reviewsApi } from "@/api/owner/reviews.api";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    Tag,
    BookOpen,
    Users,
    Star,
    Settings,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ReviewResponse {
    id: number;
    bookingId: number;
    propertyId: number;
    guestId: number;
    overallRating: number;
    cleanlinessRating: number;
    comfortRating: number;
    serviceRating: number;
    diningRating: number;
    locationRating: number;
    valueRating: number;
    comment: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    photoUrls: any;
    createdAt: string;
}

interface PropertyOption {
    id: number;
    name: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function avg(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

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

function parsePhotoUrls(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
        return raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // State
    const [properties, setProperties] = useState<PropertyOption[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [summaryStats, setSummaryStats] = useState({
        averageRating: 0,
        avgCleanliness: 0,
        avgComfort: 0,
        avgService: 0,
    });
    const [loading, setLoading] = useState(true);
    const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

    const navItems = [
        { label: "Dashboard",  icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Staff",      icon: <Users size={18} />, href: "/owner/staff" },
        { label: "Reviews",    icon: <Star size={18} />, href: "/owner/reviews", active: true },
        { label: "Messages",   icon: <MessageSquare size={18} />, href: "/owner/message" },
        { label: "Settings",   icon: <Settings size={18} />, href: "/owner/setting/accountSetting" },
    ];

    // Fetch properties list for filter dropdown
    useEffect(() => {
        propertiesApi
            .listProperties(ownerId, 1, 100)
            .then((data) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const list: PropertyOption[] = (data.content ?? data.properties ?? data ?? []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                }));
                setProperties(list);
            })
            .catch(() => setProperties([]));
    }, [ownerId]);

    // Fetch reviews whenever page or property selection changes
    useEffect(() => {
        setLoading(true);
        if (selectedPropertyId === null) {
            // All properties
            reviewsApi
                .getAllReviews(currentPage, 10)
                .then((data) => {
                    const content: ReviewResponse[] = data.content ?? [];
                    setReviews(content);
                    setTotalPages(data.totalPages ?? 1);
                    setTotalReviews(data.totalElements ?? content.length);

                    // Compute our own summary stats from the returned page
                    setSummaryStats({
                        averageRating: avg(content.map((r) => r.overallRating)),
                        avgCleanliness: avg(content.map((r) => r.cleanlinessRating)),
                        avgComfort: avg(content.map((r) => r.comfortRating)),
                        avgService: avg(content.map((r) => r.serviceRating)),
                    });
                })
                .catch(() => {
                    setReviews([]);
                    setTotalPages(1);
                    setTotalReviews(0);
                })
                .finally(() => setLoading(false));
        } else {
            // Specific property — use summary endpoint
            reviewsApi
                .getPropertyReviews(selectedPropertyId, currentPage, 10)
                .then((data) => {
                    const content: ReviewResponse[] = data.recentReviews ?? data.content ?? [];
                    setReviews(content);
                    setTotalPages(data.totalPages ?? 1);
                    setTotalReviews(data.totalReviews ?? content.length);
                    setSummaryStats({
                        averageRating: data.averageRating ?? 0,
                        avgCleanliness: data.avgCleanliness ?? 0,
                        avgComfort: data.avgComfort ?? 0,
                        avgService: data.avgService ?? 0,
                    });
                })
                .catch(() => {
                    setReviews([]);
                    setTotalPages(1);
                    setTotalReviews(0);
                })
                .finally(() => setLoading(false));
        }
    }, [selectedPropertyId, currentPage]);

    const selectedPropertyName =
        selectedPropertyId === null
            ? "All Properties"
            : properties.find((p) => p.id === selectedPropertyId)?.name ?? "Property";

    const pageStart = currentPage * 10 + 1;
    const pageEnd = Math.min((currentPage + 1) * 10, totalReviews);

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                background: "#faf9f7",
                overflow: "hidden",
                fontFamily: "sans-serif",
            }}
        >
            {/* ── Sidebar ── */}
            <nav
                style={{
                    width: 170,
                    background: "#fff",
                    borderRight: "1px solid #e8e8e8",
                    padding: "16px 0",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <div style={{ padding: "0 16px 20px" }}>
                    <Logo width={120} height={36} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 16px",
                                fontSize: 13,
                                textDecoration: "none",
                                transition: "all 0.15s",
                                cursor: "pointer",
                                borderLeft: item.active ? "3px solid #953002" : "3px solid transparent",
                                background: item.active ? "rgba(149,48,2,0.08)" : "transparent",
                                color: item.active ? "#953002" : "#4f4f4f",
                                fontWeight: item.active ? 700 : 500,
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    overflow: "hidden",
                }}
            >
                {/* Top Bar */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        padding: "8px 32px",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <a
                            href="/owner/message"
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                borderRadius: 6,
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
                                width: 32,
                                height: 32,
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

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 40px" }}>
                    {/* Page Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 28,
                                    fontWeight: 900,
                                    color: "#1d1d1d",
                                    margin: 0,
                                    letterSpacing: 1,
                                }}
                            >
                                REVIEWS
                            </h1>
                            <div style={{ marginTop: 4, fontSize: 13 }}>
                                <span style={{ color: "#953002", fontWeight: 800, fontSize: 18 }}>{totalReviews}</span>{" "}
                                <span style={{ color: "#828282" }}>total reviews</span>
                            </div>
                        </div>

                        {/* Property Filter Dropdown */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setPropertyDropdownOpen((v) => !v)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 14px",
                                    background: "#fff",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#1d1d1d",
                                    cursor: "pointer",
                                    minWidth: 180,
                                    justifyContent: "space-between",
                                }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Building2 size={14} color="#953002" />
                                    {selectedPropertyName}
                                </span>
                                <ChevronDown size={14} color="#828282" />
                            </button>
                            {propertyDropdownOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 4px)",
                                        right: 0,
                                        background: "#fff",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 8,
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                        zIndex: 100,
                                        minWidth: 200,
                                        overflow: "hidden",
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedPropertyId(null);
                                            setCurrentPage(0);
                                            setPropertyDropdownOpen(false);
                                        }}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "9px 14px",
                                            background: selectedPropertyId === null ? "rgba(149,48,2,0.06)" : "transparent",
                                            border: "none",
                                            fontSize: 13,
                                            fontWeight: selectedPropertyId === null ? 700 : 500,
                                            color: selectedPropertyId === null ? "#953002" : "#1d1d1d",
                                            cursor: "pointer",
                                        }}
                                    >
                                        All Properties
                                    </button>
                                    {properties.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPropertyId(p.id);
                                                setCurrentPage(0);
                                                setPropertyDropdownOpen(false);
                                            }}
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                textAlign: "left",
                                                padding: "9px 14px",
                                                background: selectedPropertyId === p.id ? "rgba(149,48,2,0.06)" : "transparent",
                                                border: "none",
                                                borderTop: "1px solid #f5f5f5",
                                                fontSize: 13,
                                                fontWeight: selectedPropertyId === p.id ? 700 : 500,
                                                color: selectedPropertyId === p.id ? "#953002" : "#1d1d1d",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 14,
                            marginBottom: 18,
                        }}
                    >
                        {/* Total Reviews */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "16px 20px",
                                gridColumn: "span 1",
                            }}
                        >
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, marginBottom: 6 }}>
                                TOTAL REVIEWS
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1d" }}>{totalReviews}</div>
                            <div style={{ fontSize: 11, color: "#828282", marginTop: 2 }}>across all guests</div>
                        </div>

                        {/* Average Rating */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "16px 20px",
                            }}
                        >
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, marginBottom: 6 }}>
                                AVG. RATING
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#953002" }}>
                                {summaryStats.averageRating > 0 ? summaryStats.averageRating.toFixed(1) : "—"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <StarRow rating={summaryStats.averageRating} size={12} />
                            </div>
                        </div>

                        {/* Cleanliness */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "16px 20px",
                            }}
                        >
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, marginBottom: 6 }}>
                                CLEANLINESS
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#1d1d1d" }}>
                                {summaryStats.avgCleanliness > 0 ? summaryStats.avgCleanliness.toFixed(1) : "—"}
                            </div>
                            <div style={{ fontSize: 10, color: "#828282", marginTop: 2 }}>avg score</div>
                        </div>

                        {/* Comfort */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "16px 20px",
                            }}
                        >
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, marginBottom: 6 }}>
                                COMFORT
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#1d1d1d" }}>
                                {summaryStats.avgComfort > 0 ? summaryStats.avgComfort.toFixed(1) : "—"}
                            </div>
                            <div style={{ fontSize: 10, color: "#828282", marginTop: 2 }}>avg score</div>
                        </div>

                        {/* Service */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "16px 20px",
                            }}
                        >
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8, marginBottom: 6 }}>
                                SERVICE
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#1d1d1d" }}>
                                {summaryStats.avgService > 0 ? summaryStats.avgService.toFixed(1) : "—"}
                            </div>
                            <div style={{ fontSize: 10, color: "#828282", marginTop: 2 }}>avg score</div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "60px 0",
                                color: "#828282",
                                fontSize: 14,
                            }}
                        >
                            Loading reviews...
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && reviews.length === 0 && (
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 14,
                                padding: "60px 0",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <MessageSquare size={40} color="#e0e0e0" />
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1d" }}>No reviews yet</div>
                            <div style={{ fontSize: 13, color: "#828282" }}>
                                {selectedPropertyId
                                    ? "This property has no reviews yet."
                                    : "You haven't received any guest reviews yet."}
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    {!loading && reviews.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {reviews.map((review) => {
                                const initials = `G${review.guestId ?? "?"}`;
                                const photos = parsePhotoUrls(review.photoUrls);

                                return (
                                    <div
                                        key={review.id}
                                        style={{
                                            background: "#fff",
                                            border: "1px solid #e8e8e8",
                                            borderRadius: 14,
                                            padding: "20px 22px",
                                        }}
                                    >
                                        {/* Review Header */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                justifyContent: "space-between",
                                                marginBottom: 12,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                {/* Avatar */}
                                                <div
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: "50%",
                                                        background: "#953002",
                                                        color: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {initials.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1d" }}>
                                                        Guest #{review.guestId}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "#b0b0b0", marginTop: 2 }}>
                                                        Booking #{review.bookingId}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <StarRow rating={review.overallRating} size={15} />
                                                <div style={{ fontSize: 11, color: "#828282", marginTop: 3 }}>
                                                    {formatDate(review.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sub-ratings Row */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 16,
                                                flexWrap: "wrap",
                                                marginBottom: 12,
                                                padding: "8px 12px",
                                                background: "#faf9f7",
                                                borderRadius: 8,
                                            }}
                                        >
                                            {[
                                                { label: "Cleanliness", val: review.cleanlinessRating },
                                                { label: "Comfort", val: review.comfortRating },
                                                { label: "Service", val: review.serviceRating },
                                                { label: "Value", val: review.valueRating },
                                                { label: "Dining", val: review.diningRating },
                                                { label: "Location", val: review.locationRating },
                                            ].map(({ label, val }) =>
                                                val != null ? (
                                                    <div
                                                        key={label}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 5,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#828282",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {label}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: 800,
                                                                color: "#953002",
                                                            }}
                                                        >
                                                            {Number(val).toFixed(1)}
                                                        </span>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>

                                        {/* Comment */}
                                        {review.comment && (
                                            <p
                                                style={{
                                                    fontSize: 13,
                                                    color: "#4f4f4f",
                                                    lineHeight: 1.6,
                                                    margin: "0 0 12px",
                                                }}
                                            >
                                                {review.comment}
                                            </p>
                                        )}

                                        {/* Photos */}
                                        {photos.length > 0 && (
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                {photos.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`Review photo ${idx + 1}`}
                                                        style={{
                                                            width: 80,
                                                            height: 60,
                                                            objectFit: "cover",
                                                            borderRadius: 6,
                                                            border: "1px solid #e8e8e8",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 18,
                                padding: "12px 16px",
                                background: "#fff",
                                border: "1px solid #e8e8e8",
                                borderRadius: 12,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#953002" }}>
                                Showing {pageStart} to {pageEnd} of {totalReviews} reviews
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "transparent",
                                        border: "none",
                                        cursor: currentPage === 0 ? "not-allowed" : "pointer",
                                        color: currentPage === 0 ? "#c0c0c0" : "#4f4f4f",
                                        borderRadius: 6,
                                    }}
                                >
                                    <ChevronLeft size={14} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            borderRadius: 6,
                                            background: currentPage === p ? "#953002" : "transparent",
                                            color: currentPage === p ? "#fff" : "#4f4f4f",
                                        }}
                                    >
                                        {p + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage === totalPages - 1}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "transparent",
                                        border: "none",
                                        cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                                        color: currentPage === totalPages - 1 ? "#c0c0c0" : "#4f4f4f",
                                        borderRadius: 6,
                                    }}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
