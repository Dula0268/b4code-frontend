'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, ShoppingCart, ClipboardList, HelpCircle } from 'lucide-react';
import { useCartStore } from '@/store/guest/ordering/cart.store';

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

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* ── Desktop secondary tab strip ── */}
      <div className="hidden md:block fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#e0e0e0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-0 justify-start">
          {ORDER_TABS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative flex items-center gap-1.5 px-5 h-11 text-[14px] font-medium transition-colors duration-200 whitespace-nowrap no-underline',
                  active
                    ? 'text-[#953002]'
                    : 'text-[#4f4f4f] hover:text-[#953002]',
                ].join(' ')}
              >
                <Icon size={15} />
                {label}
                {label === 'Cart' && isHydrated && itemCount > 0 && (
                  <span className="bg-[#953002] text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 leading-none">
                    {itemCount}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#953002] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[rgba(0,0,0,0.1)] shadow-[0px_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-14 px-2">
          {ORDER_TABS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative no-underline"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#953002]" />
                )}
                <div className="relative">
                  <Icon size={20} color={active ? '#953002' : '#828282'} />
                  {label === 'Cart' && isHydrated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#953002] text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: active ? '#953002' : '#828282' }}
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
