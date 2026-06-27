'use client';

import React, { useEffect } from 'react';
import GuestTopbar from '@/components/shared/layout/guest-shell/guest-topbar';
import OrderTabBar from '@/components/guest/ordering/order-tab-bar';
import AccessDenied from "@/components/shared/auth/access-denied";
import { useAuthStore } from "@/store/auth/auth.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";

import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";

import GuestGlobalOrdersProvider from '@/components/guest/ordering/guest-global-orders-provider';
import { MenuSkeleton } from "@/app/guest/order/page";

interface OrderingShellProps {
  children: React.ReactNode;
}

export default function OrderingShell({ children }: OrderingShellProps) {
  const { user, isRestoring } = useAuthStore();
  const initializeSession = useGuestSessionStore((s) => s.initializeSession);
  const qrContext = useOrderContextStore((s) => s.qrContext);

  useEffect(() => {
    if (qrContext && qrContext.propertyId && qrContext.location) {
      initializeSession(qrContext.propertyId, qrContext.location);
    }
  }, [qrContext, initializeSession]);

  if (isRestoring) return <MenuSkeleton />;

  if (user && user.role?.toLowerCase() !== "guest") {
    return <AccessDenied userRole={user.role?.toLowerCase()} requiredRole="Guest" />;
  }

  return (
    <GuestGlobalOrdersProvider>
      <div className="bg-white min-h-screen overflow-x-hidden">
        {/* Main guest navbar — identical to /guest/my-room */}
        <GuestTopbar />

        {/* Order-specific sub-tabs (Menu / Cart / My Orders / Help) */}
        <OrderTabBar />

        {/*
          pt-16  = GuestTopbar (64px)
          md:pt-[108px] = GuestTopbar (64px) + OrderTabBar (44px) on desktop
          pb-14 md:pb-0  = space for the mobile bottom tab bar
        */}
        <main className="max-w-7xl mx-auto pt-16 md:pt-[108px] pb-14 md:pb-0">
          {children}
        </main>
      </div>
    </GuestGlobalOrdersProvider>
  );
}
