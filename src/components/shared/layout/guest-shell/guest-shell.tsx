'use client';

import React from 'react';
import GuestTopbar from './guest-topbar';

interface GuestShellProps {
  children: React.ReactNode;
}

export default function GuestShell({ children }: GuestShellProps) {
  return (
    <div className="bg-white min-h-screen pt-16 overflow-x-hidden">
      <GuestTopbar />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
