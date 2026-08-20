"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore, type MenuItem } from "@/store/guest/ordering/cart.store";
import { useGuestReviewsStore } from "@/store/guest/reviews/reviews.store";
import type { MenuItemDetail } from "@/mocks/menu-items";

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
  location,
}: {
  item: MenuItem | MenuItemDetail;
  location?: string;
}) {
  const [qty, setQty] = React.useState(1);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    item.variants && item.variants.length > 0 ? item.variants[0].id : ""
  );
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, Record<string, boolean>>>({});
  const [specialInstructions, setSpecialInstructions] = React.useState("");
  const [activeImage, setActiveImage] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<"newest" | "rating-high" | "helpful">("newest");
  const router = useRouter();

  const addToCart = useCartStore((s) => s.add);
  const getReviewsForItem = useGuestReviewsStore((s) => s.getReviewsForItem);
  const getAverageRating = useGuestReviewsStore((s) => s.getAverageRating);
  const fetchReviewsForItem = useGuestReviewsStore((s) => s.fetchReviewsForItem);

  React.useEffect(() => {
    fetchReviewsForItem(item.id);
  }, [item.id, fetchReviewsForItem]);

  const itemReviews = React.useMemo(() => {
    return getReviewsForItem(item.id);
  }, [item.id, getReviewsForItem]);

  const avgRating = React.useMemo(() => {
    return getAverageRating(item.id);
  }, [item.id, getAverageRating]);

  const sortedReviews = React.useMemo(() => {
    const arr = [...itemReviews];
    if (sortBy === "rating-high") {
      arr.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "helpful") {
      arr.sort((a, b) => b.helpful - a.helpful);
    } else {
      arr.sort((a, b) => b.timestamp - a.timestamp);
    }
    return arr;
  }, [itemReviews, sortBy]);

  const gallery = React.useMemo(() => {
    if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls;
    const detail = item as MenuItemDetail;
    if (detail.gallery && detail.gallery.length > 0) return detail.gallery;
    return item.imageUrl ? [item.imageUrl] : [];
  }, [item.imageUrls, item.imageUrl]);

  const heroSrc = gallery[activeImage] ?? item.imageUrl;
  const itemTitle = (item as { title?: string }).title ?? item.name ?? "Item";
  const detailItem = item as MenuItemDetail;

  const selectedVariant = React.useMemo(() => {
    if (!selectedVariantId || !item.variants) return null;
    return item.variants.find((v) => v.id === selectedVariantId);
  }, [selectedVariantId, item.variants]);

  const basePrice = selectedVariant ? selectedVariant.price : (item.price || 0);

  const modifiersPrice = React.useMemo(() => {
    let sum = 0;
    if (!item.modifiers) return sum;
    item.modifiers.forEach((m) => {
      const selections = selectedOptions[m.id];
      if (selections) {
        m.options.forEach((o) => {
          if (selections[o.label]) {
            sum += o.price;
          }
        });
      }
    });
    return sum;
  }, [selectedOptions, item.modifiers]);

  const unitPrice = basePrice + modifiersPrice;
  const totalPrice = unitPrice * qty;

  const handleAddToCart = () => {
    const selMods: { modifierId: string; optionLabel: string }[] = [];
    if (item.modifiers) {
      item.modifiers.forEach((m) => {
        const selections = selectedOptions[m.id];
        if (selections) {
          m.options.forEach((o) => {
            if (selections[o.label]) {
              selMods.push({ modifierId: String(m.id), optionLabel: o.label });
            }
          });
        }
      });
    }

    addToCart(item, qty, selectedVariantId || undefined, selMods);
    router.push("/guest/order/cart");
  };

  return (
    <div className="max-w-[1680px] mx-auto px-4 md:px-6 py-4 md:py-12">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-sm md:text-base mb-4 md:mb-8 px-1">
        <Link href="/guest/order" className="flex items-center gap-1 text-gray-400 hover:text-[var(--brand-primary)] transition-colors">
          {/* Home icon */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className="text-gray-400">Home</span>
        <ChevronRight />
        <Link href="/guest/order/menu" className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors">
          Menu
        </Link>
        <ChevronRight />
        <span className="text-[var(--brand-primary)] font-medium">{itemTitle}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
        {/* ════════════════════ LEFT: Item Info ════════════════════ */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Hero image */}
          <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <div className="relative h-[220px] md:h-[352px] w-full bg-gray-100">
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={itemTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : null}
            </div>
            {/* Badge overlay */}
            {item.tag ? (
              <div className="absolute left-4 top-3 flex flex-wrap gap-1.5">
                {item.tag.split(",").map((tagStr) => {
                  const tagTrimmed = tagStr.trim();
                  return (
                    <span key={tagTrimmed} className="inline-block rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] shadow-sm">
                      {TAG_LABELS[tagTrimmed] ?? tagTrimmed}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Thumbnail gallery */}
          {gallery.length > 1 && (
            <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
              {gallery.map((src: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={[
                    "relative h-20 w-24 overflow-hidden rounded-xl border-2 transition cursor-pointer",
                    idx === activeImage
                      ? "border-[var(--brand-primary)] shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100",
                  ].join(" ")}
                >
                  <Image
                    src={src}
                    alt={`${itemTitle} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title row + Price */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                {itemTitle}
              </h1>
              <span className="text-xl md:text-3xl font-bold text-[var(--brand-primary)] leading-7 md:leading-9 whitespace-nowrap">
                {formatLkr(unitPrice)}
              </span>
            </div>

            {/* Rating · Tag · Prep time */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {detailItem.rating ? (
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold text-gray-700">{detailItem.rating}</span>
                  {detailItem.reviewCount ? (
                    <span>({detailItem.reviewCount} reviews)</span>
                  ) : null}
                </div>
              ) : null}
              {item.tag ? (
                item.tag.split(",").map((tagStr) => {
                  const tagTrimmed = tagStr.trim();
                  return (
                    <React.Fragment key={tagTrimmed}>
                      <Dot />
                      <span>{TAG_LABELS[tagTrimmed] ?? tagTrimmed}</span>
                    </React.Fragment>
                  );
                })
              ) : null}
              {detailItem.prepTime ? (
                <>
                  <Dot />
                  <span>{detailItem.prepTime}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-base text-gray-600 leading-6">
            <p>{item.description}</p>
            {detailItem.longDescription ? <p>{detailItem.longDescription}</p> : null}
          </div>

          {/* Allergen / dietary tags */}
          {detailItem.allergens && detailItem.allergens.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4">
              {detailItem.allergens.map((tag: string) => (
                <div
                  key={tag}
                  className="rounded-full border border-orange-100/60 bg-orange-50/60 px-3.5 py-1.5 text-sm font-medium text-[var(--brand-primary)]"
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ════════════════════ RIGHT: Customisation Panel ════════════════════ */}
        <div className="w-full md:w-[432px] md:shrink-0 md:sticky md:top-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 space-y-6 overflow-hidden relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/5 to-transparent pointer-events-none" />
            {/* Header */}
            <div className="border-b border-gray-100 pb-4 space-y-2 relative z-10">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Customize your order
                </h2>
                <p className="text-xs font-semibold text-[var(--brand-primary)]">
                  For {location}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Select options and quantity
              </p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between rounded-2xl bg-white/80 border border-gray-100 shadow-sm p-4 relative z-10">
              <span className="font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-gray-900 w-5 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Portion/Size selector */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-3 relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Portion / Size
                </p>
                <div className="space-y-2">
                  {item.variants.map((v) => (
                    <label
                      key={v.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariantId === v.id}
                          onChange={() => setSelectedVariantId(v.id)}
                          className="h-4 w-4 border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {v.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--brand-primary)]">
                        {formatLkr(v.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Customisable Modifiers */}
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="space-y-4 relative z-10">
                {item.modifiers.map((m) => (
                  <div key={m.id} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {m.name}
                    </p>
                    <div className="space-y-1">
                      {m.options.map((o) => {
                        const isSelected = selectedOptions[m.id]?.[o.label] || false;
                        return (
                          <label
                            key={o.label}
                            className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  setSelectedOptions((prev) => ({
                                    ...prev,
                                    [m.id]: {
                                      ...(prev[m.id] || {}),
                                      [o.label]: !!checked,
                                    },
                                  }))
                                }
                                className="border-gray-300 data-[state=checked]:bg-[var(--brand-primary)] data-[state=checked]:border-[var(--brand-primary)]"
                              />
                              <span className="text-sm text-gray-700">
                                {o.label}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {o.price === 0 ? "Free" : `+${formatLkr(o.price)}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Removed Special Instructions */}

            {/* Total + CTA */}
            <div className="pt-2 relative z-10">
              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatLkr(totalPrice)}
                  </span>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full h-14 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  Add to Cart
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
                <p className="text-center text-xs text-gray-400 font-medium">
                  Charges will be added to {location} bill
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ GUEST REVIEWS SECTION ════════════════════ */}
      <div className="mt-16 pt-12 border-t border-gray-100">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Guest Reviews
            </h2>
            {itemReviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet for this dish.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={star <= Math.round(avgRating) ? "#f59e0b" : "none"}
                        stroke={star <= Math.round(avgRating) ? "#f59e0b" : "#e5e7eb"}
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {avgRating.toFixed(1)} out of 5
                  </span>
                  <span className="text-sm text-gray-500">
                    ({itemReviews.length} {itemReviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>

                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "rating-high" | "helpful")}
                  className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  <option value="newest">Newest first</option>
                  <option value="rating-high">Highest rating</option>
                  <option value="helpful">Most helpful</option>
                </select>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {itemReviews.length === 0 ? (
            <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-500 m-0">
                Guests can leave reviews for this dish after ordering.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition"
                >
                  {/* Review header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {review.guestName || "Guest"}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "#f59e0b" : "none"}
                          stroke={star <= review.rating ? "#f59e0b" : "#e5e7eb"}
                          strokeWidth="1.5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  {/* Review text */}
                  {review.reviewText && (
                    <p className="text-[13px] text-gray-600 leading-[18px] mb-3">
                      {review.reviewText}
                    </p>
                  )}

                  {/* Helpful count */}
                  {review.helpful > 0 && (
                    <div className="text-xs text-gray-500">
                      👍 {review.helpful} {review.helpful === 1 ? "person found" : "people found"} this helpful
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function Dot() {
  return <div className="h-1 w-1 rounded-full bg-gray-300" />;
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-300">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
