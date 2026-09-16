"use client";

import React, { useState, useEffect } from "react";
import OwnerHeader from "@/components/owner/layout/owner-header";
import { Star, CheckCircle2, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ownerPricingApi } from "@/api/owner/pricing.api";
import api from "@/lib/axios";
import { toast } from "sonner";

type ReviewType = "booking" | "item";

export default function OwnerReviewsPage() {
  const [reviewType, setReviewType] = useState<ReviewType>("booking");
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [properties, setProperties] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Load owner properties on mount
  useEffect(() => {
    ownerPricingApi
      .getOwnerProperties()
      .then((list) => {
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load properties:", err);
        toast.error("Failed to load your properties.");
      });
  }, []);

  // Fetch reviews whenever property or type changes
  useEffect(() => {
    if (selectedPropertyId === null) return;

    const endpoint =
      reviewType === "booking"
        ? `/staff/reviews/booking?propertyId=${selectedPropertyId}`
        : `/staff/reviews?propertyId=${selectedPropertyId}`;

    setIsLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        toast.error("Failed to load reviews.");
        setReviews([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedPropertyId, reviewType]);

  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.guest_name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.menu_item_name?.toLowerCase().includes(q)
    );
  });

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-[#C05621] text-[#C05621]" : "text-[#E8E8E8]"}
        />
      ))}
    </div>
  );

  return (
    <>
      <OwnerHeader
        title="Reviews"
        subtitle="See what guests are saying about your property and restaurant"
        searchPlaceholder="Search reviews..."
        onSearch={(q) => setSearch(q)}
        actions={
          properties.length > 0 ? (
            <div className="flex items-center gap-2 bg-[#F5F6F8] border border-[#E8EAED] rounded-full px-3 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#953002]" />
              <select
                value={selectedPropertyId ?? ""}
                onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                aria-label="Select property"
                className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer text-xs"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        }
      />

      <main className="mt-[64px] flex-1 p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Tab Switcher */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3">
          <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8]">
            <button
              onClick={() => setReviewType("booking")}
              className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${
                reviewType === "booking"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#9E7B6A] hover:text-[#1A1A1A]"
              }`}
            >
              Property Reviews
            </button>
            <button
              onClick={() => setReviewType("item")}
              className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${
                reviewType === "item"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#9E7B6A] hover:text-[#1A1A1A]"
              }`}
            >
              Food &amp; Restaurant Reviews
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 text-[13px] text-[#9E7B6A]">
            <Star size={14} className="fill-[#C05621] text-[#C05621]" />
            <span className="font-semibold">{filteredReviews.length} reviews</span>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F0EBE7]">
            <div className="col-span-3 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">
              Guest &amp; Date
            </div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">
              {reviewType === "item" ? "Item" : "Property"}
            </div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">
              Rating
            </div>
            <div className="col-span-5 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">
              Comment
            </div>
          </div>

          <div className="p-3 flex flex-col gap-2">
            {isLoading ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="hidden lg:grid grid-cols-12 gap-4 px-4 py-4 rounded-2xl border border-[#F0EBE7] bg-white"
                >
                  <div className="col-span-3 flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Skeleton className="h-7 w-24 rounded-lg" />
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Skeleton key={s} className="h-3.5 w-3.5 rounded-sm" />
                    ))}
                  </div>
                  <div className="col-span-5 flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#9E7B6A]">
                <CheckCircle2 className="h-12 w-12 text-[#2D7D5C] opacity-40 mb-4" />
                <p className="text-[15px] font-bold text-[#1c1917] m-0">No reviews yet</p>
                <p className="text-[13px] mt-1">
                  {reviewType === "booking"
                    ? "Guest stay reviews will appear here."
                    : "Food & restaurant reviews will appear here."}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-4 py-4 lg:items-center rounded-2xl border border-[#F0EBE7] bg-white hover:border-[#E8DDD8] hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-200"
                >
                  {/* Guest & Date */}
                  <div className="lg:col-span-3 flex flex-col justify-center">
                    <span className="text-[14px] font-bold text-[#1A1A1A]">
                      {review.guest_name || "Guest"}
                    </span>
                    <span className="text-[12px] font-medium text-[#9E7B6A]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Item / Property label */}
                  <div className="lg:col-span-2 flex items-center">
                    <span className="text-[13px] font-semibold text-[#1A1A1A] bg-[#FFF8F0] px-3 py-1 rounded-lg inline-block">
                      {reviewType === "item" ? review.menu_item_name || "Menu Item" : "Stay Review"}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="lg:col-span-2 flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-[12px] font-bold text-[#C05621]">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <p className="text-[13px] text-[#1A1A1A] leading-relaxed line-clamp-2 m-0">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
