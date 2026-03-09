"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useGuestReviewsStore } from "@/store/guest/reviews/reviews.store";
import type { MenuItem } from "@/store/guest/order/cart-store";

const TAG_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  VEG: { label: "Veg", bg: "#dcfce7", text: "#15803d" },
  SPICY: { label: "Spicy", bg: "#fef2f2", text: "#dc2626" },
  NON_VEG: { label: "Non Veg", bg: "#fef3c7", text: "#92400e" },
  POPULAR: { label: "Popular", bg: "#973102", text: "#ffffff" },
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

  const tagInfo = item.tag ? TAG_CONFIG[item.tag] : null;

  return (
    <Card className="overflow-hidden rounded-xl border border-[#f3f4f6] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col !p-0 !gap-0">
      {/* Image — full-bleed, no gaps */}
      <Link href={`/guest/order/${item.id}`} className="block">
        <div className="relative h-[90px] md:h-[148px] w-full bg-[#f3f4f6] cursor-pointer hover:opacity-90 transition overflow-hidden -mt-px">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="px-2 py-1.5 md:px-3 md:py-3 flex flex-col flex-1">
        {/* Title + Tag + Rating */}
        <div className="flex items-start justify-between gap-1 md:gap-2 pb-0.5 md:pb-1.5">
          <h3 className="text-[11px] md:text-sm font-bold text-[#111827] leading-[14px] md:leading-5 line-clamp-1 md:line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {tagInfo ? (
              <span
                className="rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium hidden sm:inline-flex"
                style={{ backgroundColor: tagInfo.bg, color: tagInfo.text }}
              >
                {tagInfo.label}
              </span>
            ) : null}
            {reviewCount > 0 && (
              <span className="rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium bg-[#fef3c7] text-[#92400e] inline-flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
                <span>{avgRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] md:text-xs text-[#6b7280] leading-3.5 md:leading-4 line-clamp-2 pb-2 md:pb-3 hidden sm:block">
          {item.description}
        </p>

        {/* Price + Add */}
        <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-1.5 md:pt-2.5 mt-auto">
          <span className="text-xs md:text-base font-bold text-[#973102] leading-4 md:leading-6">
            {formatLkr(item.priceLkr)}
          </span>

          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="flex items-center justify-center h-6 w-6 md:h-8 md:w-8 rounded-md md:rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "rgba(151,49,2,0.1)" }}
            aria-label={`Add ${item.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1V13M1 7H13" stroke="#973102" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
