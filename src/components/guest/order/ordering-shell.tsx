'use client';

import React from 'react';
import GuestTopbar from '@/components/shared/layout/guest-shell/guest-topbar';
import OrderTabBar from '@/components/guest/order/order-tab-bar';

interface OrderingShellProps {
  children: React.ReactNode;
}

export default function OrderingShell({ children }: OrderingShellProps) {
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
