"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useGuestReviewsStore } from "@/store/guest/reviews/reviews.store";
import type { MenuItem } from "@/store/guest/ordering/cart.store";

const TAG_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  VEG: { label: "Veg", bg: "bg-green-50/80 backdrop-blur-md border border-green-100", text: "text-green-700" },
  SPICY: { label: "Spicy", bg: "bg-red-50/80 backdrop-blur-md border border-red-100", text: "text-red-700" },
  NON_VEG: { label: "Non Veg", bg: "bg-orange-50/80 backdrop-blur-md border border-orange-100", text: "text-orange-700" },
  POPULAR: { label: "Popular", bg: "bg-[var(--brand-primary)]", text: "text-white" },
};

export default function MenuItemCard({
  item,
  onAdd,
  formatLkr,
}: {
  item: MenuItem;
  onAdd: () => void;
  formatLkr: (n: number) => string;
}) {
  const getAverageRating = useGuestReviewsStore((s) => s.getAverageRating);
  const getReviewsForItem = useGuestReviewsStore((s) => s.getReviewsForItem);

  const avgRating = React.useMemo(() => {
    return getAverageRating(item.id);
  }, [item.id, getAverageRating]);

  const reviewCount = React.useMemo(() => {
    return getReviewsForItem(item.id).length;
  }, [item.id, getReviewsForItem]);

  const tagsList = React.useMemo(() => {
    if (!item.tag) return [];
    return item.tag.split(",").map((t) => t.trim()).filter(Boolean);
  }, [item.tag]);

  return (
    <Card className="group overflow-hidden rounded-2xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col !p-0 !gap-0 bg-white/60 backdrop-blur-xl relative">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image — Aspect ratio, Zoom on hover */}
      <Link href={`/guest/order/${item.id}`} className="block relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
        
        {/* Overlay gradient for text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 relative z-10">
        {/* Title + Tag + Rating */}
        <div className="flex items-start justify-between gap-2 pb-1.5">
          <h3 className="text-xs md:text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors">
            {item.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end max-w-[140px]">
            {tagsList.map((tag) => {
              const tagInfo = TAG_CONFIG[tag];
              if (!tagInfo) return null;
              
              // Handle custom inline styles vs Tailwind classes
              const isPopular = tag === "POPULAR";
              
              return (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide hidden sm:inline-flex shadow-sm ${isPopular ? "bg-[var(--brand-primary)] text-white" : tagInfo.bg + " " + tagInfo.text}`}
                >
                  {tagInfo.label}
                </span>
              );
            })}
            {reviewCount > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] md:text-xs font-bold bg-orange-50/80 backdrop-blur-md border border-orange-100/50 text-[var(--brand-primary)] inline-flex items-center gap-1 shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
                <span>{avgRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 pb-3 hidden sm:block">
          {item.description}
        </p>

        {/* Price + Quick Add */}
        <div className="flex items-center justify-between mt-auto relative">
          <span className="text-xs md:text-sm font-bold tracking-tight text-[var(--brand-primary)]">
            {formatLkr(item.priceLkr)}
          </span>

          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg cursor-pointer transition-all duration-300 md:opacity-0 md:-translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 text-white font-semibold text-xs shadow-[0_4px_12px_rgba(217,119,6,0.2)] hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)] bg-[var(--brand-primary)] hover:bg-[#C05621]"
            aria-label={`Add ${item.title}`}
          >
            <span>Add</span>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* Mobile persistent add button (fallback for touch where hover isn't present) */}
          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="md:hidden flex items-center justify-center h-7 w-7 rounded-lg cursor-pointer bg-orange-50 border border-orange-100/50 transition-colors absolute right-0 shadow-sm"
            aria-label={`Add ${item.title}`}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1V13M1 7H13" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
