'use client';

import React from 'react';
import OrderingTopbar from '@/components/guest/order/ordering-topbar';

interface OrderingShellProps {
  children: React.ReactNode;
}

export default function OrderingShell({ children }: OrderingShellProps) {
  return (
    <div className="bg-white min-h-screen pt-[48px] md:pt-[60px] pb-13 md:pb-0 overflow-x-hidden">
      <OrderingTopbar />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
