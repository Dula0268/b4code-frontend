'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Utensils, ShoppingCart, ClipboardList, HelpCircle, LogOut, Settings, Menu, X } from 'lucide-react';
import Logo from '@/components/shared/branding/logo';
import { useCartStore } from '@/store/guest/ordering/cart.store';
import { useAuthStore } from '@/store/auth/auth.store';

const navigationItems = [
  {
    label: 'Menu',
    href: '/guest/order/menu',
    icon: Utensils,
  },
  {
    label: 'Cart',
    href: '/guest/order/cart',
    icon: ShoppingCart,
  },
  {
    label: 'My Orders',
    href: '/guest/order/my-orders',
    icon: ClipboardList,
  },
  {
    label: 'Help',
    href: '/guest/order/help',
    icon: HelpCircle,
  },
];

export default function OrderingTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount());
  const user = useAuthStore((s) => s.user);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const logout = useAuthStore((s) => s.logout);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen]);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    router.push('/');
  };

  const getInitials = () => {
    if (user?.profile) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'G';
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* ═══════════ Desktop / Top Bar ═══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0]">
        <div className="w-full px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center nav — Desktop only */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'relative flex items-center gap-1.5 px-4 h-16 text-[15px] font-medium transition-colors duration-200 whitespace-nowrap',
                    active
                      ? 'text-[#953002]'
                      : 'text-[#4f4f4f] hover:text-[#953002]',
                  ].join(' ')}
                >
                  <Icon size={17} />
                  {item.label}
                  {/* Cart badge */}
                  {item.label === 'Cart' && itemCount > 0 && (
                    <span className="ml-0.5 bg-[#953002] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                      {itemCount}
                    </span>
                  )}
                  {/* Active underline */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#953002] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: avatar or auth */}
          <div className="flex items-center gap-3">
            {/* Desktop avatar / auth */}
            <div className="hidden md:block">
              {!mounted || (isRestoring && !user) ? (
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="relative w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold ring-2 ring-[#953002]/20 cursor-pointer hover:ring-4 transition-all"
                    aria-label="Account menu"
                  >
                    {getInitials()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27AE60] border-2 border-white" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e8e8e8] py-2 z-60 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
                        <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                          {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                        </p>
                        <p className="text-[11px] text-[#828282] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/guest/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#4f4f4f] hover:bg-[#f8f8f8] hover:text-[#953002] transition-colors no-underline"
                      >
                        <Settings size={15} /> Profile Settings
                      </Link>
                      <div className="border-t border-[#f0f0f0] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#953002] rounded-lg hover:bg-[#6d2200] transition-colors no-underline whitespace-nowrap"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#1d1d1d]"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#e0e0e0] bg-white px-6 py-4 flex flex-col gap-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-3 py-3 px-3 rounded-xl text-[15px] font-medium no-underline transition-colors',
                    active
                      ? 'text-[#953002] bg-[#953002]/5'
                      : 'text-[#333333] hover:bg-[#f8f8f8] hover:text-[#953002]',
                  ].join(' ')}
                >
                  <Icon size={18} />
                  {item.label}
                  {item.label === 'Cart' && itemCount > 0 && (
                    <span className="ml-auto bg-[#953002] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                      {itemCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile auth */}
            {mounted && (
              <div className="pt-3 border-t border-[#e0e0e0] mt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                        {getInitials()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
                          {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                        </p>
                        <p className="text-[11px] text-[#828282] truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 border-2 border-red-400 rounded-lg cursor-pointer"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-sm font-semibold text-center text-white bg-[#953002] rounded-lg no-underline"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ═══════════ Mobile bottom tab bar ═══════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[rgba(0,0,0,0.1)] shadow-[0px_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-14 px-2">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative no-underline"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#953002]" />
                )}
                <div className="relative">
                  <Icon size={20} color={active ? '#953002' : '#828282'} />
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
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
