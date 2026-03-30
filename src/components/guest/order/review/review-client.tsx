"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/guest/order/order-store";
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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer p-0.5 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                fill={filled ? "#F2C94C" : "none"}
                stroke={filled ? "#F2C94C" : "#E0E0E0"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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

  const orderItems = order?.lines ?? [];
  const roomNumber = order?.roomNumber ?? "304";

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

  const handleSubmit = () => {
    // Submit reviews for items that have been rated
    Object.entries(itemReviews).forEach(([itemId, review]) => {
      if (review.rating > 0) {
        const item = orderItems.find((line) => line.item.id === itemId);
        if (item) {
          addReview({
            itemId: item.item.id,
            itemTitle: item.item.title,
            rating: review.rating,
            reviewText: review.text,
            guestName: `Guest Room ${roomNumber}`,
            timestamp: Date.now(),
            helpful: 0,
          });
        }
      }
    });

    router.push("/guest/order/thank-you");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fafaf9] px-4 py-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1D1D1D] leading-[36px] mb-2">
            Rate Your Items
          </h1>
          <p className="text-[14px] text-[#828282] leading-[20px]">
            Share your feedback about each item from your order
          </p>
        </div>

        {/* Items Review Grid */}
        <div className="space-y-4 mb-6">
          {orderItems.length === 0 ? (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 text-center">
              <p className="text-[14px] text-[#828282]">
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
                  className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#1D1D1D] leading-[22px] mb-1">
                        {line.item.title}
                      </h3>
                      <p className="text-[13px] text-[#828282] leading-[18px]">
                        Qty: {line.qty}x • Price: {formatLkr(line.item.priceLkr * line.qty)}
                      </p>
                    </div>
                  </div>

                  {/* Rating for item */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[13px] font-semibold text-[#333333] leading-[18px] mb-2 block">
                        How would you rate this item?
                      </label>
                      <StarRating
                        value={review.rating}
                        onChange={(v) => handleItemRatingChange(itemId, v)}
                      />
                    </div>

                    {/* Comment for item */}
                    <div>
                      <label className="text-[13px] font-semibold text-[#333333] leading-[18px] mb-2 block">
                        Share your thoughts
                      </label>
                      <textarea
                        value={review.text}
                        onChange={(e) =>
                          handleItemTextChange(itemId, e.target.value)
                        }
                        placeholder="What did you like or dislike about this item?"
                        className="w-full h-[60px] border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#333333] placeholder:text-[#828282] leading-[18px] resize-none focus:outline-none focus:ring-2 focus:ring-[#973102]/20 focus:border-[#973102] transition"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/guest/order/thank-you")}
            className="text-[14px] font-medium text-[#828282] hover:text-[#973102] transition cursor-pointer"
          >
            Skip Reviews
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#973102] rounded-lg px-6 py-3 text-[14px] font-semibold text-white leading-[20px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition cursor-pointer"
          >
            Submit Reviews
          </button>
        </div>
      </div>
    </div>
  );
}


