"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import { useStaffOrdersStore, type Order } from "@/store/staff/orders/staff-orders.store";
import {
  BellRing,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Individual notification card ─────────────────────────────────────────────
function OrderNotificationCard({
  order,
  onAccept,
  onReject,
  onView,
  onDismiss,
}: {
  order: Order;
  onAccept: () => void;
  onReject: () => void;
  onView: () => void;
  onDismiss: () => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAccepting(true);
    try {
      await onAccept();
      toast.success(`Order ${order.id} accepted successfully.`);
    } catch (err) {
      console.error("Failed to accept order:", err);
      let msg = "Failed to accept order";
      if (err instanceof Error) {
        msg = err.message;
      }
      if (typeof err === "object" && err !== null) {
        const axErr = err as { response?: { data?: { message?: string } } };
        if (axErr.response?.data?.message) {
          msg = axErr.response.data.message;
        }
      }
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRejecting(true);
    try {
      await onReject();
      toast.success(`Order ${order.id} rejected.`);
    } catch (err) {
      console.error("Failed to reject order:", err);
      let msg = "Failed to reject order";
      if (err instanceof Error) {
        msg = err.message;
      }
      if (typeof err === "object" && err !== null) {
        const axErr = err as { response?: { data?: { message?: string } } };
        if (axErr.response?.data?.message) {
          msg = axErr.response.data.message;
        }
      }
      toast.error(msg);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
        border: "1px solid #f0ede9",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        animation: "slideInNotif 0.32s cubic-bezier(0.22,1,0.36,1)",
        gap: "12px",
      }}
    >
      {/* Tiny absolute dismiss button at top right */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        title="Dismiss"
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "transparent",
          border: "none",
          color: "#a8a29e",
          cursor: "pointer",
          padding: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#78716c")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#a8a29e")}
      >
        <X size={10} />
      </button>

      {/* Left side: Order ID & minor info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1c1917" }}>
          Order #{order.id}
        </div>
        {(order.table || order.type) && (
          <div style={{ fontSize: "10px", color: "#78716c", fontWeight: 500 }}>
            {order.table || "Guest"} • {order.type}
          </div>
        )}
      </div>

      {/* Right side: Action marks */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* View Info mark */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView();
          }}
          title="View Info"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid #e7e5e4",
            background: "#faf9f8",
            color: "#44403c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f5f4";
            e.currentTarget.style.borderColor = "#d6d3d1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#faf9f8";
            e.currentTarget.style.borderColor = "#e7e5e4";
          }}
        >
          <Eye size={14} />
        </button>

        {/* Reject mark */}
        <button
          onClick={handleReject}
          disabled={rejecting || accepting}
          title="Reject Order"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid #fee2e2",
            background: rejecting ? "#fee2e2" : "#fef2f2",
            color: "#dc2626",
            cursor: rejecting || accepting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: rejecting || accepting ? 0.6 : 1,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!rejecting && !accepting) {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fecaca";
            }
          }}
          onMouseLeave={(e) => {
            if (!rejecting && !accepting) {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.borderColor = "#fee2e2";
            }
          }}
        >
          {rejecting ? (
            <span style={{ fontSize: "10px", fontWeight: "bold" }}>...</span>
          ) : (
            <XCircle size={14} />
          )}
        </button>

        {/* Accept mark */}
        <button
          onClick={handleAccept}
          disabled={accepting || rejecting}
          title="Accept Order"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "none",
            background: accepting
              ? "#16a34a"
              : "linear-gradient(135deg, #973102 0%, #c04a0a 100%)",
            color: "#fff",
            cursor: accepting || rejecting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: accepting ? "none" : "0 2px 6px rgba(151,49,2,0.2)",
            opacity: accepting || rejecting ? 0.6 : 1,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!accepting && !rejecting) {
              e.currentTarget.style.filter = "brightness(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!accepting && !rejecting) {
              e.currentTarget.style.filter = "none";
            }
          }}
        >
          {accepting ? (
            <span style={{ fontSize: "10px", fontWeight: "bold" }}>...</span>
          ) : (
            <CheckCircle2 size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main provider ─────────────────────────────────────────────────────────────
export default function StaffGlobalOrdersProvider() {
  const { user } = useAuthStore();
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const setupSse = useStaffOrdersStore((s) => s.setupSse);
  const stopSse = useStaffOrdersStore((s) => s.stopSse);
  const orders = useStaffOrdersStore((s) => s.orders);
  const acceptOrder = useStaffOrdersStore((s) => s.acceptOrder);
  const rejectOrder = useStaffOrdersStore((s) => s.rejectOrder);
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(0);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const propertyId = user?.propertyId || localStorage.getItem("selected_property_id") || "1";
    fetchOrders(Number(propertyId));
    setupSse(Number(propertyId));
    
    // Poll every 15s to ensure no orders are missed if SSE drops or status transitions post-creation
    const interval = setInterval(() => {
      fetchOrders(Number(propertyId));
    }, 15000);
    
    return () => {
      stopSse();
      clearInterval(interval);
    };
  }, [user, fetchOrders, setupSse, stopSse]);

  const placedOrders = orders.filter((o) => o.status === "placed" && !dismissed.has(o.id));

  // Auto-expand when new orders arrive, auto-collapse after 4s
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (placedOrders.length > prevCountRef.current) {
      setCollapsed(false);
      timer = setTimeout(() => {
        setCollapsed(true);
      }, 4000);
    }
    prevCountRef.current = placedOrders.length;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [placedOrders.length]);

  const dismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from header
    draggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleHeaderClick = () => {
    if (hasMovedRef.current) return;
    setCollapsed(!collapsed);
  };

  if (placedOrders.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideInNotif {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes bellPulse {
          0%,100% { transform: rotate(0deg); }
          20%     { transform: rotate(-15deg); }
          40%     { transform: rotate(15deg); }
          60%     { transform: rotate(-8deg); }
          80%     { transform: rotate(8deg); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Sticky header / toggle (Draggable) */}
        <div
          onClick={handleHeaderClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
            color: "#fff",
            borderRadius: collapsed ? "16px" : "16px 16px 0 0",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "grab",
            userSelect: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            touchAction: "none",
          }}
          onPointerDownCapture={(e) => {
            (e.currentTarget as HTMLElement).style.cursor = "grabbing";
          }}
          onPointerUpCapture={(e) => {
            (e.currentTarget as HTMLElement).style.cursor = "grab";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #973102, #c04a0a)",
                borderRadius: "10px",
                padding: "6px",
                display: "flex",
                animation: "bellPulse 1.5s ease-in-out infinite",
              }}
            >
              <BellRing size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>
                New Orders Pending
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>
                {placedOrders.length} order{placedOrders.length !== 1 ? "s" : ""} awaiting action
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                background: "linear-gradient(135deg, #973102, #c04a0a)",
                color: "#fff",
                borderRadius: "20px",
                padding: "2px 9px",
                fontSize: "11px",
                fontWeight: 800,
                minWidth: "22px",
                textAlign: "center",
              }}
            >
              {placedOrders.length}
            </span>
            {collapsed ? <ChevronUp size={16} color="rgba(255,255,255,0.7)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.7)" />}
          </div>
        </div>

        {/* Cards - Maximum 2 */}
        {!collapsed && (
          <div
            className="notif-card-container"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "65vh",
              overflowY: "auto",
              padding: "10px 0 4px",
              background: "transparent",
            }}
          >
            {placedOrders.slice(0, 2).map((order) => (
              <OrderNotificationCard
                key={order.id}
                order={order}
                onAccept={() => acceptOrder(order.id)}
                onReject={() => rejectOrder(order.id, "Rejected via notification")}
                onView={() => {
                  router.push(`/staff/orders`);
                  setCollapsed(true);
                }}
                onDismiss={() => dismiss(order.id)}
              />
            ))}
            {placedOrders.length > 2 && (
              <div style={{ textAlign: "center", fontSize: "12px", color: "#78716c", fontWeight: 600, padding: "4px 0" }}>
                + {placedOrders.length - 2} more orders pending...
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
