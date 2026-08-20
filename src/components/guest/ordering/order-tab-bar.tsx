'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ShoppingCart, ClipboardList, HelpCircle } from 'lucide-react';
import { useCartStore } from '@/store/guest/ordering/cart.store';
import { useOrderContextStore } from '@/store/guest/ordering/order-context.store';

const ORDER_TABS = [
  { label: 'Menu',      href: '/guest/order/menu',      icon: Utensils     },
  { label: 'Cart',      href: '/guest/order/cart',      icon: ShoppingCart },
  { label: 'My Orders', href: '/guest/order/my-orders', icon: ClipboardList },
  { label: 'Help',      href: '/guest/order/help',      icon: HelpCircle   },
];

export default function OrderTabBar() {
  const pathname   = usePathname();
  const itemCount  = useCartStore((s) => s.itemCount());
  const [isHydrated, setIsHydrated] = React.useState(false);
  const qrContext = useOrderContextStore((s) => s.qrContext);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getHref = (base: string) => qrContext?.qrId ? `${base}?qrId=${qrContext.qrId}` : base;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* ── Desktop Floating Pill Tab Bar ── */}
      <div className="hidden md:flex fixed top-[88px] left-0 right-0 z-40 justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full px-2 py-1.5 flex items-center gap-1 pointer-events-auto transition-all duration-300">
          {ORDER_TABS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={getHref(href)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-300 no-underline overflow-hidden group ${
                  active
                    ? 'text-white'
                    : 'text-[#4f4f4f] hover:text-[#1d1d1d] hover:bg-gray-100/50'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)] to-[#c05621] rounded-full -z-10" />
                )}
                <Icon size={16} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{label}</span>
                {label === 'Cart' && isHydrated && itemCount > 0 && (
                  <span className={`text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center px-1.5 rounded-full leading-none shadow-sm transition-colors ${
                    active ? 'bg-white text-[var(--brand-primary)]' : 'bg-[var(--brand-primary)] text-white'
                  }`}>
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Mobile bottom tab bar (Glassmorphism) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {ORDER_TABS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={getHref(href)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative no-underline group"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-[var(--brand-primary)] shadow-[0_0_8px_rgba(149,48,2,0.6)]" />
                )}
                <div className="relative p-1.5 rounded-xl transition-colors duration-300 group-hover:bg-[var(--brand-primary)]/5">
                  <Icon 
                    size={22} 
                    className={`transition-all duration-300 ${active ? 'text-[var(--brand-primary)] scale-110' : 'text-[#828282]'}`} 
                  />
                  {label === 'Cart' && isHydrated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-md border-2 border-white animate-bounce-short">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors duration-300 ${active ? 'text-[var(--brand-primary)]' : 'text-[#828282]'}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
