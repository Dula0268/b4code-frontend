"use client";

import { useEffect, useRef } from "react";
import { useOrderStore, OrderStatus } from "@/store/guest/ordering/order.store";
import { toast } from "sonner";
import api from "@/lib/axios";

function mapBackendStatus(backendStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    NEW: "placed",
    PREPARING: "accepted",
    READY: "in-progress",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    PAYMENT_PENDING: "placed",
    payment_pending: "placed",
    placed: "placed",
    accepted: "accepted",
    "in-progress": "in-progress",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusMap[backendStatus] || (statusMap[backendStatus.toLowerCase()] as OrderStatus) || "placed";
}

export default function GuestGlobalOrdersProvider({ children }: { children: React.ReactNode }) {
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const orderHistory = useOrderStore((s) => s.orderHistory);
  const advanceStatus = useOrderStore((s) => s.advanceStatus);
  const updateHistoryOrderStatus = useOrderStore((s) => s.updateHistoryOrderStatus);

  const activeStreams = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Collect all active orders that are not delivered or cancelled
    const activeOrders = new Map<string, string>();
    
    if (currentOrder && !["delivered", "cancelled"].includes(currentOrder.currentStatus)) {
      activeOrders.set(currentOrder.id.replace("#ORD-", ""), currentOrder.currentStatus);
    }
    
    orderHistory.forEach((o) => {
      if (!["delivered", "cancelled"].includes(o.currentStatus)) {
        activeOrders.set(o.id.replace("#ORD-", ""), o.currentStatus);
      }
    });

    // 2. Set up SSE streams for active orders
    activeOrders.forEach((status, orderId) => {
      if (!activeStreams.current.has(orderId)) {
        activeStreams.current.add(orderId);
        
        const eventSource = new EventSource(`${api.defaults.baseURL}/orders/${orderId}/stream`);

        eventSource.addEventListener("status-update", (event) => {
          try {
            const data = JSON.parse(event.data);
            const mappedStatus = mapBackendStatus(data.status);
            const fullOrderId = `#ORD-${orderId}`;
            
            // Avoid duplicate toasts if the status hasn't actually changed
            const storeCurrentOrder = useOrderStore.getState().currentOrder;
            const storeOrderHistory = useOrderStore.getState().orderHistory;
            
            let isChanged = false;
            if (storeCurrentOrder && storeCurrentOrder.id === fullOrderId && storeCurrentOrder.currentStatus !== mappedStatus) {
              isChanged = true;
              advanceStatus(mappedStatus, data.rejectionReason);
            }
            
            const historyOrder = storeOrderHistory.find(o => o.id === fullOrderId);
            if (historyOrder && historyOrder.currentStatus !== mappedStatus) {
              isChanged = true;
              updateHistoryOrderStatus(fullOrderId, mappedStatus);
            }

            if (isChanged) {
              toast.success(`Order ${fullOrderId} is now ${mappedStatus}`, { duration: 5000 });
            }

            // Close stream if terminal state
            if (mappedStatus === "delivered" || mappedStatus === "cancelled") {
              eventSource.close();
              activeStreams.current.delete(orderId);
            }
          } catch (err) {
            console.error("Failed to parse SSE event", err);
          }
        });

        eventSource.onerror = () => {
          eventSource.close();
          activeStreams.current.delete(orderId);
        };
      }
    });

    return () => {
      // We do not cleanup active streams on unmount so they stay persistent across route changes
      // They will close automatically when the order is delivered/cancelled
    };
  }, [currentOrder, orderHistory, advanceStatus, updateHistoryOrderStatus]);

  return <>{children}</>;
}
