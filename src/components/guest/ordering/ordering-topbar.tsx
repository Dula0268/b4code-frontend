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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 h-[72px] flex items-center justify-between">
          
          {/* Logo on Left */}
          <div className="flex-shrink-0 hover:scale-105 transition-transform duration-300">
            <Logo />
          </div>

          {/* Everything else on Right */}
          <div className="flex items-center gap-6">
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'relative flex items-center gap-2 px-4 py-2 rounded-2xl text-[15px] font-semibold transition-all duration-300 group no-underline',
                      active
                        ? 'text-white bg-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20'
                        : 'text-gray-600 hover:text-[var(--brand-primary)] hover:bg-white/60',
                    ].join(' ')}
                  >
                    <Icon size={18} className={active ? "text-white" : "text-gray-500 group-hover:text-[var(--brand-primary)] transition-colors"} />
                    {item.label}
                    {/* Cart badge */}
                    {item.label === 'Cart' && itemCount > 0 && (
                      <span className={[
                        "ml-1 text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 leading-none transition-colors",
                        active ? "bg-white text-[var(--brand-primary)]" : "bg-[var(--brand-primary)] text-white"
                      ].join(' ')}>
                        {itemCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth / Avatar */}
            <div className="hidden md:block pl-2 border-l border-gray-200/60">
              {!mounted || (isRestoring && !user) ? (
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-[var(--brand-primary)] text-[14px] font-bold border-2 border-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                    aria-label="Account menu"
                  >
                    {getInitials()}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 p-2 z-60 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 bg-gray-50/50 rounded-2xl mb-2">
                        <p className="text-[14px] font-bold text-gray-900 truncate">
                          {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                        </p>
                        <p className="text-[12px] font-medium text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href="/guest/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] rounded-xl transition-colors no-underline"
                      >
                        <Settings size={18} /> Profile Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-full border border-gray-100/80 shadow-sm">
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                    className="px-6 py-2.5 text-[14px] font-bold text-gray-700 rounded-full hover:bg-white hover:shadow-sm hover:text-[var(--brand-primary)] transition-all duration-300 no-underline whitespace-nowrap"
                  >
                    Log In
                  </Link>
                  <Link
                    href={`/auth/register?role=guest&redirect=${encodeURIComponent(pathname)}`}
                    className="px-6 py-2.5 text-[14px] font-bold text-white bg-[var(--brand-primary)] rounded-full hover:scale-105 active:scale-95 shadow-md shadow-[var(--brand-primary)]/20 transition-all duration-300 no-underline whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg px-6 py-6 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-4 py-3.5 px-5 rounded-2xl text-[16px] font-bold no-underline transition-all duration-300',
                    active
                      ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--brand-primary)]',
                  ].join(' ')}
                >
                  <Icon size={20} className={active ? "text-[var(--brand-primary)]" : "text-gray-500"} />
                  {item.label}
                  {item.label === 'Cart' && itemCount > 0 && (
                    <span className="ml-auto bg-[var(--brand-primary)] text-white text-[12px] font-bold rounded-full min-w-[24px] h-[24px] flex items-center justify-center px-1.5 leading-none shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile auth */}
            {mounted && (
              <div className="pt-4 border-t border-gray-100 mt-2">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[var(--brand-primary)] text-[16px] font-bold flex-shrink-0 shadow-inner">
                        {getInitials()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 truncate">
                          {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
                        </p>
                        <p className="text-[13px] font-medium text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full py-3.5 text-[15px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors cursor-pointer"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                      className="w-full py-3.5 text-[15px] font-bold text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl no-underline transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href={`/auth/register?role=guest&redirect=${encodeURIComponent(pathname)}`}
                      className="w-full py-3.5 text-[15px] font-bold text-center text-white bg-[var(--brand-primary)] shadow-md shadow-[var(--brand-primary)]/20 rounded-2xl hover:scale-[1.02] transition-transform no-underline"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ═══════════ Mobile bottom tab bar ═══════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 relative no-underline group"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-[var(--brand-primary)]" />
                )}
                <div className="relative">
                  <Icon 
                    size={22} 
                    className={active ? "text-[var(--brand-primary)]" : "text-gray-400 group-hover:text-gray-600 transition-colors"} 
                  />
                  {item.label === 'Cart' && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 leading-none shadow-sm ring-2 ring-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={['text-[10px] font-bold leading-none transition-colors', active ? 'text-[var(--brand-primary)]' : 'text-gray-400 group-hover:text-gray-600'].join(' ')}
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
