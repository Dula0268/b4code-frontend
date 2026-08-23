'use client';

import React from 'react';
import GuestTopbar from './guest-topbar';
import MobileBottomNav from './mobile-bottom-nav';

interface GuestShellProps {
  children: React.ReactNode;
}

export default function GuestShell({ children }: GuestShellProps) {
  return (
    <div className="bg-white min-h-screen pt-[115px] md:pt-16 pb-28 md:pb-0">
      <GuestTopbar />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
