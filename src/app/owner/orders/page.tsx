/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { ownerOrdersApi } from "@/api/owner/orders.api";
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
    MessageSquare,
    Star,
    Settings,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    AlertCircle,
} from "lucide-react";

/* ─────────────────────────── types ─────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

type StatusFilter = "ALL" | "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    PENDING:   { bg: "#fff8e1", color: "#f59e0b" },
    PREPARING: { bg: "#e8f0fe", color: "#1e6fd9" },
    READY:     { bg: "#e6f9ee", color: "#27ae60" },
    DELIVERED: { bg: "#f0f0f0", color: "#828282" },
    CANCELLED: { bg: "#fff3f3", color: "#eb5757" },
};

const STATUS_FILTERS: StatusFilter[] = ["ALL", "PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

/* ─────────────────────────── helpers ─────────────────────────── */
function formatDate(val: string | null | undefined): string {
    if (!val) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(val));
    } catch {
        return val;
    }
}

/* ─────────────────────────── component ─────────────────────────── */
export default function OrdersPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    /* ── properties ── */
    const [properties, setProperties] = useState<AnyRecord[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [propDropOpen, setPropDropOpen] = useState(false);

    /* ── orders ── */
    const [orders, setOrders] = useState<AnyRecord[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0); // 0-based (API uses page=0)
    const [loading, setLoading] = useState(false);

    /* ── filter ── */
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    /* ── nav ── */
    const navItems = [
        { label: "Dashboard",  icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />,       href: "/owner/properties" },
        { label: "Staff",      icon: <Users size={18} />,           href: "/owner/staff" },
        { label: "Reviews",    icon: <Star size={18} />,            href: "/owner/reviews" },
        { label: "Messages",   icon: <MessageSquare size={18} />,   href: "/owner/message" },
        { label: "Settings",   icon: <Settings size={18} />,        href: "/owner/setting/accountSetting" },
    ];

    /* ── fetch properties ── */
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await propertiesApi.listProperties(ownerId, 1, 100);
                const list: AnyRecord[] = data.properties ?? data.content ?? data ?? [];
                setProperties(list);
                if (list.length > 0) setSelectedPropertyId(list[0].id ?? list[0].propertyId);
            } catch (e) {
                console.error("Failed to load properties", e);
            }
        };
        fetch();
    }, [ownerId]);

    /* ── fetch orders ── */
    useEffect(() => {
        if (!selectedPropertyId) return;
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPropertyId, currentPage]);

    const fetchOrders = async () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const data = await ownerOrdersApi.getOrdersByProperty(selectedPropertyId, currentPage, 15);
            const list: AnyRecord[] = data.orders ?? data.content ?? data ?? [];
            setOrders(list);
            setTotalPages(data.totalPages ?? 1);
            setTotalItems(data.totalItems ?? data.totalElements ?? list.length);
        } catch (e) {
            console.error("Failed to load orders", e);
        } finally {
            setLoading(false);
        }
    };

    /* ── client-side status filter ── */
    const visibleOrders = statusFilter === "ALL"
        ? orders
        : orders.filter(o => (o.status ?? "").toUpperCase() === statusFilter);

    /* ── selected property name ── */
    const selectedProperty = properties.find(p => (p.id ?? p.propertyId) === selectedPropertyId);

    /* ─────────────── render ─────────────── */
    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, background: "#faf9f7", overflow: "hidden", fontFamily: "sans-serif" }}>

            {/* ── Nav Sidebar ── */}
            <nav style={{ width: 170, background: "#fff", borderRight: "1px solid #e8e8e8", padding: "16px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "0 16px 20px" }}>
                    <Logo width={120} height={36} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 16px", fontSize: 13, textDecoration: "none",
                                transition: "all 0.15s", cursor: "pointer",
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
            <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                {/* Top Bar */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "8px 32px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <a href="/owner/message" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", textDecoration: "none" }}>
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" style={{ display: "block", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid #953002" }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                        </a>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 32px 40px" }}>
                    {/* Page Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1d1d1d", margin: 0, letterSpacing: 1 }}>F&amp;B ORDER HISTORY</h1>
                            <div style={{ marginTop: 4, fontSize: 13 }}>
                                <span style={{ color: "#953002", fontWeight: 800, fontSize: 18 }}>{totalItems}</span>{" "}
                                <span style={{ color: "#828282" }}>total orders</span>
                            </div>
                        </div>
                    </div>

                    {/* Property Selector */}
                    <div style={{ marginBottom: 24, position: "relative", display: "inline-block" }}>
                        <button
                            onClick={() => setPropDropOpen(v => !v)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#1d1d1d", cursor: "pointer", minWidth: 220 }}
                        >
                            <Building2 size={15} color="#953002" />
                            <span style={{ flex: 1, textAlign: "left" }}>{selectedProperty ? (selectedProperty.name ?? selectedProperty.propertyName ?? "Property") : "Select a property…"}</span>
                            <ChevronDown size={15} color="#828282" />
                        </button>
                        {propDropOpen && (
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200, minWidth: 220, overflow: "hidden" }}>
                                {properties.length === 0 && (
                                    <div style={{ padding: "12px 16px", fontSize: 13, color: "#828282" }}>No properties found</div>
                                )}
                                {properties.map(p => {
                                    const pid = p.id ?? p.propertyId;
                                    return (
                                        <button
                                            key={pid}
                                            onClick={() => { setSelectedPropertyId(pid); setCurrentPage(0); setPropDropOpen(false); }}
                                            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: pid === selectedPropertyId ? "rgba(149,48,2,0.06)" : "transparent", border: "none", cursor: "pointer", fontSize: 13, color: pid === selectedPropertyId ? "#953002" : "#1d1d1d", fontWeight: pid === selectedPropertyId ? 700 : 400, textAlign: "left" }}
                                        >
                                            {pid === selectedPropertyId && <Check size={13} />}
                                            {p.name ?? p.propertyName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Status Filter Tabs */}
                    <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e8e8e8", marginBottom: 20 }}>
                        {STATUS_FILTERS.map(sf => (
                            <button
                                key={sf}
                                onClick={() => setStatusFilter(sf)}
                                style={{
                                    padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer",
                                    fontSize: 12, fontWeight: statusFilter === sf ? 700 : 500,
                                    color: statusFilter === sf ? "#953002" : "#4f4f4f",
                                    borderBottom: statusFilter === sf ? "2px solid #953002" : "2px solid transparent",
                                    marginBottom: -2,
                                }}
                            >
                                {sf.charAt(0) + sf.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Orders Table */}
                    {!selectedPropertyId ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#828282" }}>
                            <AlertCircle size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                            <p style={{ margin: 0, fontSize: 14 }}>Select a property to view orders.</p>
                        </div>
                    ) : loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                            <div style={{ width: 36, height: 36, border: "3px solid #e8e8e8", borderTop: "3px solid #953002", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        </div>
                    ) : visibleOrders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#828282" }}>
                            <UtensilsCrossed size={40} color="#e0e0e0" style={{ marginBottom: 12 }} />
                            <p style={{ margin: 0, fontSize: 14 }}>No orders found{statusFilter !== "ALL" ? ` with status "${statusFilter}"` : ""}.</p>
                        </div>
                    ) : (
                        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>ORDER ID</th>
                                        <th style={thStyle}>GUEST NAME</th>
                                        <th style={thStyle}>ROOM / TABLE</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>ITEMS</th>
                                        <th style={{ ...thStyle, textAlign: "right" }}>TOTAL</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>STATUS</th>
                                        <th style={thStyle}>TIME</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleOrders.map((order, i) => {
                                        const status: string = (order.status ?? "PENDING").toUpperCase();
                                        const statusStyle = STATUS_STYLE[status] ?? { bg: "#f0f0f0", color: "#828282" };
                                        const itemCount: number = order.itemCount ?? order.items?.length ?? order.orderItems?.length ?? 0;
                                        const total: number = parseFloat(order.totalAmount ?? order.total ?? 0);
                                        const guestName: string = order.guestName ?? order.guest?.name ?? order.customerName ?? "Guest";
                                        const roomTable: string = order.roomNumber ?? order.tableNumber ?? order.location ?? "—";
                                        const orderId: string = order.orderId ?? order.id ?? `#${i + 1}`;
                                        const time: string = formatDate(order.createdAt ?? order.orderTime ?? order.time);

                                        return (
                                            <tr key={order.id ?? i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#953002", fontFamily: "monospace" }}>#{String(orderId).replace(/^#/, "")}</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5ede9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#953002", flexShrink: 0 }}>
                                                            {guestName.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1d" }}>{guestName}</span>
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: 13, color: "#4f4f4f" }}>{roomTable}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1d" }}>{itemCount}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "right" }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1d" }}>Rs. {total.toFixed(2)}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 12, background: statusStyle.bg, color: statusStyle.color, letterSpacing: 0.5 }}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontSize: 12, color: "#828282" }}>{time}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderTop: "1px solid #e8e8e8" }}>
                                <span style={{ fontSize: 12, color: "#953002" }}>
                                    Showing {currentPage * 15 + 1}–{Math.min((currentPage + 1) * 15, totalItems)} of {totalItems} orders
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: currentPage === 0 ? "not-allowed" : "pointer", color: currentPage === 0 ? "#c0c0c0" : "#4f4f4f", borderRadius: 6 }}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: currentPage === p ? "#953002" : "transparent", color: currentPage === p ? "#fff" : "#4f4f4f", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, borderRadius: 6 }}
                                        >
                                            {p + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer", color: currentPage >= totalPages - 1 ? "#c0c0c0" : "#4f4f4f", borderRadius: 6 }}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ── shared cell styles ── */
const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "#828282", letterSpacing: 0.8,
    padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #e8e8e8",
};

const tdStyle: React.CSSProperties = {
    padding: "13px 16px", verticalAlign: "middle",
};
