"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/auth.store";
import { useStaffOrdersStore } from "@/store/staff/orders/staff-orders.store";
import { BellRing, CheckCircle2, ChevronRight, X, AlertTriangle, MapPin, Utensils } from "lucide-react";
import { toast } from "sonner";

export default function StaffGlobalOrdersProvider() {
  const { user } = useAuthStore();
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const setupSse = useStaffOrdersStore((s) => s.setupSse);
  const stopSse = useStaffOrdersStore((s) => s.stopSse);
  const orders = useStaffOrdersStore((s) => s.orders);
  const acceptOrder = useStaffOrdersStore((s) => s.acceptOrder);
  const router = useRouter();

  const prevCountRef = useRef(0);

  useEffect(() => {
    const propertyId = user?.propertyId || (typeof window !== "undefined" ? localStorage.getItem("selected_property_id") : "1") || "1";
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

  const placedOrders = orders.filter((o) => o.status === "placed");

  // Trigger custom notification sound when a new placed order arrives
  useEffect(() => {
    if (placedOrders.length > prevCountRef.current) {
      // Find the new orders (assuming the new ones are at the start of the array)
      const newOrdersCount = placedOrders.length - prevCountRef.current;
      const newOrders = placedOrders.slice(0, newOrdersCount);

      newOrders.forEach((order) => {
        // Attempt to play a notification sound
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch(e) {}
      });
    }
    prevCountRef.current = placedOrders.length;
  }, [placedOrders, acceptOrder, router]);

  return null;
}
