'use client';

import React from 'react';
import GuestTopbar from '@/components/shared/layout/guest-shell/guest-topbar';
import OrderTabBar from '@/components/guest/ordering/order-tab-bar';
import AccessDenied from "@/components/shared/auth/access-denied";
import { useAuthStore } from "@/store/auth/auth.store";

interface OrderingShellProps {
  children: React.ReactNode;
}

export default function OrderingShell({ children }: OrderingShellProps) {
  const { user, isRestoring } = useAuthStore();

  if (isRestoring) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (user && user.role?.toLowerCase() !== "guest") {
    return <AccessDenied userRole={user.role?.toLowerCase()} requiredRole="Guest" />;
  }

  return (
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
  );
}
