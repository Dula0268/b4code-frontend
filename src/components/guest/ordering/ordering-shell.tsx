'use client';

import React, { useEffect } from 'react';
import OrderingTopbar from '@/components/guest/ordering/ordering-topbar';
import AccessDenied from "@/components/shared/auth/access-denied";
import { useAuthStore } from "@/store/auth/auth.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";

import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useCartStore } from "@/store/guest/ordering/cart.store";

import GuestGlobalOrdersProvider from '@/components/guest/ordering/guest-global-orders-provider';
import { MenuSkeleton } from "@/components/guest/ordering/menu/menu-skeleton";

interface OrderingShellProps {
  children: React.ReactNode;
}

export default function OrderingShell({ children }: OrderingShellProps) {
  const { user, isRestoring } = useAuthStore();
  const initializeSession = useGuestSessionStore((s) => s.initializeSession);
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const fetchChargesFromApi = useCartStore((s) => s.fetchChargesFromApi);

  useEffect(() => {
    if (qrContext && qrContext.propertyId && qrContext.location) {
      initializeSession(qrContext.propertyId, qrContext.location);
      fetchChargesFromApi(qrContext.propertyId);
    }
  }, [qrContext, initializeSession, fetchChargesFromApi]);

  if (isRestoring) return <MenuSkeleton />;

  if (user && user.role?.toLowerCase() !== "guest") {
    return <AccessDenied userRole={user.role?.toLowerCase()} requiredRole="Guest" />;
  }

  return (
    <GuestGlobalOrdersProvider>
      <div className="bg-[#FCFAFC] min-h-screen overflow-x-hidden flex flex-col">
        {/* New consolidated guest ordering navbar */}
        <OrderingTopbar />

        {/* Topbar spacing (64px) + gap */}
        <main className="max-w-5xl mx-auto w-full pt-[80px] pb-20 md:pb-8 flex-1 flex flex-col px-4 md:px-6">
          {children}
        </main>
      </div>
    </GuestGlobalOrdersProvider>
  );
}
