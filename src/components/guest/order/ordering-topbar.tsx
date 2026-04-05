'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/guest/order/cart-store';

const navigationItems = [
  {
    label: 'Menu',
    href: '/guest/order/menu',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h10v2H4v-2z" fill={active ? '#953002' : '#828282'} />
      </svg>
    ),
  },
  {
    label: 'Cart',
    href: '/guest/order/cart',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'My Orders',
    href: '/guest/order/my-orders',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" />
        <path d="M9 12h6M9 16h4" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'My Room',
    href: '/guest/order/my-room',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 21V7l9-4 9 4v14"
          stroke={active ? '#953002' : '#828282'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21v-6h6v6"
          stroke={active ? '#953002' : '#828282'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 10h18"
          stroke={active ? '#953002' : '#828282'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Help',
    href: '/guest/order/help',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" />
        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" stroke={active ? '#953002' : '#828282'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function OrderingTopbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ═══════════ Desktop topbar ═══════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-white h-[48px] md:h-[60px]"
        style={{
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.15)',
          boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="h-full max-w-[1440px] mx-auto flex items-center justify-between px-3 md:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/prime-stay-logo.svg"
              alt="Prime Stay"
              width={134}
              height={50}
              priority
              className="h-[26px] md:h-[50px] w-auto"
            />
          </div>

          {/* Navigation Tabs — hidden on mobile */}
          <nav className="h-full hidden md:flex items-center gap-0 flex-1 justify-end">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className="h-full">
                  <div
                    className="relative h-full flex items-end pb-3 px-3.5 text-base font-medium transition-colors cursor-pointer"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '22.4px',
                      color: active ? '#953002' : '#828282',
                    }}
                  >
                    {item.label}
                    {/* Cart badge — desktop */}
                    {item.label === 'Cart' && itemCount > 0 && (
                      <span className="ml-1 bg-[#953002] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none -translate-y-0.5">
                        {itemCount}
                      </span>
                    )}
                    {/* Tab indicator */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: active ? '#953002' : '#E0E0E0' }}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Profile Avatar — hidden on mobile */}
          <div className="relative hidden md:flex items-center justify-center ml-8">
            <div className="relative" style={{ width: 48, height: 53 }}>
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: 48,
                  height: 48,
                  border: '3px solid #2F80ED',
                  background: 'linear-gradient(135deg, #FFD9CB 0%, #F5B1B1 100%)',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="#8B5A2B" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#8B5A2B" strokeWidth="2" fill="#F5B1B1" />
                    <circle cx="12" cy="10" r="5" fill="#FFD9CB" />
                    <rect x="7" y="9" width="3" height="2" rx="0.5" fill="none" stroke="#333" strokeWidth="0.5" />
                    <rect x="14" y="9" width="3" height="2" rx="0.5" fill="none" stroke="#333" strokeWidth="0.5" />
                    <line x1="10" y1="10" x2="14" y2="10" stroke="#333" strokeWidth="0.5" />
                    <circle cx="8.5" cy="10" r="0.5" fill="#333" />
                    <circle cx="15.5" cy="10" r="0.5" fill="#333" />
                    <path d="M7 7c0-3 2-4 5-4s5 1 5 4" fill="#B34A00" />
                  </svg>
                </div>
              </div>
              {/* Approved badge */}
              <div
                className="absolute flex items-center justify-center rounded-full"
                style={{ width: 18, height: 18, backgroundColor: '#27AE60', bottom: 0, right: 0 }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile avatar — shown on mobile only */}
          <div className="md:hidden relative flex items-center justify-center">
            <div
              className="relative rounded-full overflow-hidden"
              style={{
                width: 32,
                height: 32,
                border: '2px solid #2F80ED',
                background: 'linear-gradient(135deg, #FFD9CB 0%, #F5B1B1 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#8B5A2B" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#8B5A2B" strokeWidth="2" fill="#F5B1B1" />
                  <circle cx="12" cy="10" r="5" fill="#FFD9CB" />
                  <circle cx="9" cy="10" r="0.7" fill="#333" />
                  <circle cx="15" cy="10" r="0.7" fill="#333" />
                  <path d="M7 7c0-3 2-4 5-4s5 1 5 4" fill="#B34A00" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ Mobile bottom tab bar ═══════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[rgba(0,0,0,0.1)] shadow-[0px_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-13 px-2">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
              >
                <div className="relative">
                  {item.icon(active)}
                  {item.label === 'Cart' && itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#953002] text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: active ? '#953002' : '#828282' }}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#953002]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
