"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/guest/ordering/order.store";
import { useGuestReviewsStore } from "@/store/guest/reviews/reviews.store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ─── Star Rating component ─── */

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = React.useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                fill={filled ? "#F59E0B" : "transparent"}
                stroke={filled ? "#F59E0B" : "#D1D5DB"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-200"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Review Client ─── */

export default function ReviewClient() {
  const router = useRouter();
  const order = useOrderStore((s) => s.currentOrder);
  const addReview = useGuestReviewsStore((s) => s.addReview);
  const submitReview = useGuestReviewsStore((s) => s.submitReview);

  const orderItems = order?.lines ?? [];
  const location = order?.location ?? "";

  // State for item reviews
  const [itemReviews, setItemReviews] = React.useState<
    Record<string, { rating: number; text: string }>
  >({});

  const handleItemRatingChange = (itemId: string, rating: number) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating },
    }));
  };

  const handleItemTextChange = (itemId: string, text: string) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], text },
    }));
  };

  const handleSubmit = async () => {
    // Extract numeric order ID from #ORD-<id>
    const numericOrderId = order?.id?.replace('#ORD-', '') || '';

    // Submit reviews for items that have been rated
    const reviewPromises = Object.entries(itemReviews)
      .filter(([, review]) => review.rating > 0)
      .map(([itemId, review]) => {
        const item = orderItems.find((line) => line.item.id === itemId);
        if (item && numericOrderId) {
            return submitReview(numericOrderId, {
              menuItemId: item.item.id,
              rating: review.rating,
              comment: review.text,
              guestName: order?.guestName || `Guest ${location}`,
            });
        }
        return Promise.resolve();
      });

    await Promise.all(reviewPromises);
    router.push("/guest/order/thank-you");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50/50 px-4 py-8">
      <div className="max-w-[880px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Rate Your Items
          </h1>
          <p className="text-base text-gray-500">
            Share your feedback about each item from your order
          </p>
        </div>

        {/* Items Review Grid */}
        <div className="space-y-4 mb-8">
          {orderItems.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-gray-500 font-medium">
                No items in your order to review
              </p>
            </div>
          ) : (
            orderItems.map((line) => {
              const itemId = line.item.id;
              const review = itemReviews[itemId] || { rating: 0, text: "" };
              return (
                <div
                  key={itemId}
                  className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {line.item.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        Qty: {line.qty}x • Price: <span className="text-[var(--brand-primary)]">{formatLkr(line.item.priceLkr * line.qty)}</span>
                      </p>
                    </div>

                    {/* Rating for item */}
                    <div className="md:w-[320px] shrink-0 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          How would you rate this item?
                        </label>
                        <StarRating
                          value={review.rating}
                          onChange={(v) => handleItemRatingChange(itemId, v)}
                        />
                      </div>

                      {/* Comment for item */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Share your thoughts
                        </label>
                        <textarea
                          value={review.text}
                          onChange={(e) =>
                            handleItemTextChange(itemId, e.target.value)
                          }
                          placeholder="What did you like or dislike about this item?"
                          className="w-full h-[80px] bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all duration-200 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-4 shadow-sm">
          <button
            onClick={() => router.push("/guest/order/thank-you")}
            className="w-full md:w-auto px-6 py-4 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-2xl transition-all cursor-pointer"
          >
            Skip Reviews
          </button>
          <button
            onClick={handleSubmit}
            className="w-full md:w-auto bg-[var(--brand-primary)] rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[#C05621] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Submit Reviews
          </button>
        </div>
      </div>
    </div>
  );
}
