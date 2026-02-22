"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/store/guest/order/cart-store";
import type { MenuItemDetail } from "@/data/menu-items";

/* ─── Tag config matching the Figma badge ─── */
const TAG_LABELS: Record<string, string> = {
  POPULAR: "Signature Dish",
  SPICY: "Spicy",
  VEG: "Vegetarian",
  NON_VEG: "Non Veg",
};

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function ItemDetailsClient({
  item,
  roomNumber = "304",
}: {
  item: MenuItemDetail;
  roomNumber?: string;
}) {
  const [qty, setQty] = React.useState(1);
  const [selectedAddOns, setSelectedAddOns] = React.useState<Record<string, boolean>>({});
  const [specialInstructions, setSpecialInstructions] = React.useState("");
  const [activeImage, setActiveImage] = React.useState(0);

  const addToCart = useCartStore((s) => s.add);

  const addOns = item.addOns ?? [];
  const gallery = item.gallery ?? (item.imageUrl ? [item.imageUrl] : []);
  const heroSrc = gallery[activeImage] ?? item.imageUrl;

  const addOnPrice = React.useMemo(() => {
    return addOns.reduce((sum, addon) => {
      return selectedAddOns[addon.id] ? sum + addon.price : sum;
    }, 0);
  }, [selectedAddOns, addOns]);

  const totalPrice = item.priceLkr * qty + addOnPrice;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(item);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-12">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-sm md:text-base mb-4 md:mb-8 px-1">
        <Link href="/guest/order" className="flex items-center gap-1">
          {/* Home icon */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className="text-[#828282]">Home</span>
        <ChevronRight />
        <Link href="/guest/order/menu" className="text-[#828282] hover:underline">
          Menu
        </Link>
        <ChevronRight />
        <span className="text-[#953002] font-medium">{item.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
        {/* ════════════════════ LEFT: Item Info ════════════════════ */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Hero image */}
          <div className="relative overflow-hidden rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="relative h-[220px] md:h-[352px] w-full bg-[#f3f4f6]">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : null}
            </div>
            {/* Badge overlay */}
            {item.tag ? (
              <div className="absolute left-4 top-3">
                <span className="inline-block rounded bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#923002] shadow-sm">
                  {TAG_LABELS[item.tag] ?? item.tag}
                </span>
              </div>
            ) : null}
          </div>

          {/* Thumbnail gallery */}
          {gallery.length > 1 && (
            <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={[
                    "relative h-20 w-24 overflow-hidden rounded-lg border-2 transition cursor-pointer",
                    idx === activeImage
                      ? "border-[#953002] shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100",
                  ].join(" ")}
                >
                  <Image
                    src={src}
                    alt={`${item.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title row + Price */}
          <div className="border-b border-[rgba(146,48,2,0.1)] pb-6">
            <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold text-[#111827] leading-tight">
                {item.title}
              </h1>
              <span className="text-xl md:text-3xl font-bold text-[#923002] leading-7 md:leading-9 whitespace-nowrap">
                {formatLkr(item.priceLkr)}
              </span>
            </div>

            {/* Rating · Tag · Prep time */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b7280]">
              {item.rating ? (
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-medium text-[#374151]">{item.rating}</span>
                  {item.reviewCount ? (
                    <span>({item.reviewCount} reviews)</span>
                  ) : null}
                </div>
              ) : null}
              {item.tag ? (
                <>
                  <Dot />
                  <span>{TAG_LABELS[item.tag] ?? item.tag}</span>
                </>
              ) : null}
              {item.prepTime ? (
                <>
                  <Dot />
                  <span>{item.prepTime}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-base text-[#4b5563] leading-6">
            <p>{item.description}</p>
            {item.longDescription ? <p>{item.longDescription}</p> : null}
          </div>

          {/* Allergen / dietary tags */}
          {item.allergens && item.allergens.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4">
              {item.allergens.map((tag) => (
                <div
                  key={tag}
                  className="rounded border border-[rgba(146,48,2,0.1)] bg-[rgba(146,48,2,0.05)] px-3.5 py-1.5 text-sm font-medium text-[#923002]"
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ════════════════════ RIGHT: Customisation Panel ════════════════════ */}
        <div className="w-full md:w-[432px] md:shrink-0 md:sticky md:top-6">
          <div className="bg-white rounded-xl border border-[rgba(146,48,2,0.05)] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] p-6 space-y-6 overflow-hidden">
            {/* Header */}
            <div className="border-b border-[rgba(146,48,2,0.1)] pb-4 space-y-2">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#111827]">
                  Customize your order
                </h2>
                <p className="text-xs font-medium text-[#923002]">
                  For Room {roomNumber}
                </p>
              </div>
              <p className="text-sm text-[#6b7280]">
                Select options and quantity
              </p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between rounded-lg bg-[#f8f6f5] p-4">
              <span className="font-semibold text-[#374151]">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-[#e5e7eb] bg-white shadow-sm text-[#4b5563] hover:bg-[#f9fafb] cursor-pointer"
                >
                  −
                </button>
                <span className="text-lg font-bold text-[#111827] w-4 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded border border-[#e5e7eb] bg-white shadow-sm text-[#4b5563] hover:bg-[#f9fafb] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add-ons */}
            {addOns.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
                  Add-ons
                </p>
                <div className="space-y-1">
                  {addOns.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg p-3.5 hover:bg-[#f9fafb] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedAddOns[addon.id] || false}
                          onCheckedChange={(checked) =>
                            setSelectedAddOns((prev) => ({
                              ...prev,
                              [addon.id]: !!checked,
                            }))
                          }
                          className="border-[#d1d5db] data-[state=checked]:bg-[#923002] data-[state=checked]:border-[#923002]"
                        />
                        <span className="text-base text-[#374151]">
                          {addon.label}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#6b7280]">
                        {addon.price === 0
                          ? "Free"
                          : `+${formatLkr(addon.price)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Special Instructions */}
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
                Special Instructions
              </p>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={`Allergies, dietary restrictions, or special requests?\n(e.g. No onions)`}
                className="h-20 w-full rounded-lg border border-[#e5e7eb] bg-[#f8f6f5] p-3.5 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#953002] resize-none"
              />
            </div>

            {/* Total + CTA */}
            <div className="pt-2">
              <div className="border-t border-[rgba(146,48,2,0.1)] pt-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6b7280]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#111827]">
                    {formatLkr(totalPrice)}
                  </span>
                </div>

                {/* Go to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full h-12 rounded-lg bg-[#973102] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(151,49,2,0.3),0px_4px_6px_-4px_rgba(151,49,2,0.3)] hover:bg-[#7c2802] transition cursor-pointer"
                >
                  Go to Cart
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8H13M13 8L9 4M13 8L9 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Note */}
                <p className="text-center text-xs text-[#9ca3af]">
                  Charges will be added to Room {roomNumber} bill
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function Dot() {
  return <div className="h-1 w-1 rounded-full bg-[#d1d5db]" />;
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M6 4L10 8L6 12"
        stroke="#828282"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
