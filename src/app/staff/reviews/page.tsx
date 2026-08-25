"use client";

import React, { useState, useEffect } from "react";
import StaffHeader from "@/components/staff/layout/staff-header";
import { Flag, Star, Search, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/auth/auth.store";
import api from "@/lib/axios";

/**
 * Which review roles can see. Mirrors the backend's staffRole gate
 * (StaffReviewController#assertKitchenReviewAccess / assertPropertyReviewAccess):
 * OWNER/ADMIN platform roles bypass entirely; STAFF accounts are scoped by
 * their staffRole, with "Staff Admin" granted both.
 */
function reviewAccess(user: { role?: string; profile?: { staffRole?: string } } | null) {
  if (!user) return { canViewItem: false, canViewBooking: false };
  if (user.role !== "staff") return { canViewItem: true, canViewBooking: true };
  const staffRole = user.profile?.staffRole;
  return {
    canViewItem: staffRole === "Kitchen Staff" || staffRole === "Staff Admin",
    canViewBooking: staffRole === "Property Staff" || staffRole === "Staff Admin",
  };
}

export default function ReviewManagementPage() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId || 1;

  const { canViewItem, canViewBooking } = reviewAccess(user);
  const [reviewType, setReviewType] = useState<"item" | "booking">(canViewItem ? "item" : "booking");
  // If access resolves after mount (e.g. user loads async) and the current
  // selection isn't actually visible to this role, fall back to whichever is.
  useEffect(() => {
    if (reviewType === "item" && !canViewItem && canViewBooking) setReviewType("booking");
    else if (reviewType === "booking" && !canViewBooking && canViewItem) setReviewType("item");
  }, [canViewItem, canViewBooking, reviewType]);

  const reviewsEndpoint = reviewType === "item" ? "/staff/reviews" : "/staff/reviews/booking";
  const flagEndpoint = (id: number | string) =>
    reviewType === "item" ? `/staff/reviews/${id}/flag` : `/staff/reviews/booking/${id}/flag`;

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "flagged">("all");

  const [search, setSearch] = useState("");
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagType, setFlagType] = useState("");

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`${reviewsEndpoint}?propertyId=${propertyId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, reviewType]);

  const searchFiltered = reviews.filter((r) => {
    return r.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.menu_item_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
  });

  const flaggedCount = searchFiltered.filter((r) => r.flagged_status != null).length;
  const filteredReviews = activeTab === "flagged" ? searchFiltered.filter((r) => r.flagged_status != null) : searchFiltered;

  const handleOpenFlagModal = (review: any) => {
    setSelectedReview(review);
    setFlagReason("");
    setFlagType("");
    setIsFlagModalOpen(true);
  };

  const handleFlagSubmit = async () => {
    if (!flagType) {
      toast.error("Please select a flag reason type.");
      return;
    }

    try {
      await api.post(flagEndpoint(selectedReview.id), {
        propertyId,
        flagType,
        flagReason,
        reviewText: selectedReview.comment,
        guestName: selectedReview.guest_name,
        rating: selectedReview.rating
      });
      
      toast.success("Review flagged successfully and sent to Admin.");
      setIsFlagModalOpen(false);
      setSelectedReview(null);
      fetchReviews(); // Refresh to update status
    } catch (err) {
      console.error("Failed to flag review", err);
      toast.error("An error occurred while flagging.");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating ? "fill-[#C05621] text-[#C05621]" : "text-[#E8E8E8]"
            }`}
          />
        ))}
      </div>
    );
  };

  if (!canViewItem && !canViewBooking) {
    return (
      <>
        <StaffHeader title="Review Management" subtitle="Monitor and moderate guest reviews" searchPlaceholder="Search reviews..." />
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-3 pt-[80px] text-center px-6">
          <ShieldAlert size={28} className="text-[#9E7B6A]" />
          <p className="text-[15px] font-bold text-[#1A1A1A]">Review management isn&apos;t available for your staff role</p>
          <p className="text-[13px] text-[#9E7B6A] max-w-sm">Ask a Staff Admin if you believe this is a mistake.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <StaffHeader
        title="Review Management"
        subtitle="Monitor and moderate guest reviews"
        searchPlaceholder="Search reviews..."
        onSearch={(query) => setSearch(query)}
      />
      
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col custom-scrollbar">
        <div className="flex flex-col flex-1 px-4 lg:px-6 py-4 lg:py-6 gap-4 lg:gap-6 pt-[80px] lg:pt-[88px] min-h-min pb-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 lg:gap-6 h-full">
        {/* Top Controls Box */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white p-4 lg:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 flex-shrink-0">
          <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#FFF8F0] flex items-center justify-center shadow-inner shrink-0">
                <Star size={20} className="text-[#C05621]" />
              </div>
              <div>
                <h2 className="text-[16px] lg:text-[18px] font-extrabold text-[#1A1A1A] m-0 leading-tight">
                  {reviewType === "item" ? "Guest Item Reviews" : "Booking Reviews"}
                </h2>
                <p className="text-[11px] lg:text-[13px] font-semibold text-[#9E7B6A] opacity-80 m-0 leading-tight hidden lg:block">Flag inappropriate content for admin moderation</p>
                <p className="text-[11px] lg:text-[13px] font-semibold text-[#9E7B6A] opacity-80 m-0 leading-tight lg:hidden">Flag inappropriate content</p>
              </div>
            </div>

            <div className="hidden lg:block h-10 border-l border-[#F0EBE7]"></div>

            {/* Item vs booking reviews — only shown to roles with access to both (Staff Admin, or OWNER/ADMIN) */}
            {canViewItem && canViewBooking && (
              <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8]">
                <button
                  onClick={() => { setReviewType("item"); setActiveTab("all"); }}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${reviewType === "item" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#9E7B6A] hover:text-[#1A1A1A]"}`}
                >
                  Item Reviews
                </button>
                <button
                  onClick={() => { setReviewType("booking"); setActiveTab("all"); }}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${reviewType === "booking" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#9E7B6A] hover:text-[#1A1A1A]"}`}
                >
                  Booking Reviews
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8] w-full lg:w-auto mt-2 lg:mt-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 lg:flex-none px-4 py-2 text-[12px] lg:text-[13px] font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${activeTab === "all" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#9E7B6A] hover:text-[#1A1A1A]"}`}
            >
              All Reviews
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0 ${activeTab === "all" ? "bg-[#F5F6F8] text-[#6B7280]" : "bg-[#E8E8E8] text-[#6B7280]"}`}>
                {searchFiltered.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("flagged")}
              className={`flex-1 lg:flex-none px-4 py-2 text-[12px] lg:text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "flagged" ? "bg-white text-[#EB5757] shadow-sm" : "text-[#9E7B6A] hover:text-[#EB5757]"}`}
            >
              <ShieldAlert size={14} />
              Flagged
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0 ${activeTab === "flagged" ? "bg-[#EB5757] text-white" : "bg-[#E8E8E8] text-[#6B7280]"}`}>
                {flaggedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Reviews Table Container (Scrollable) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-none flex flex-col overflow-hidden">
          
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F0EBE7] flex-shrink-0">
            <div className="col-span-3 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Guest & Date</div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">{reviewType === "item" ? "Item" : "Property"}</div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Rating</div>
            <div className="col-span-4 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Comment</div>
            <div className="col-span-1 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase text-center">Action</div>
          </div>

          <div className="flex-none p-2">
            <div className="flex flex-col gap-2 lg:gap-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#9E7B6A]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C05621] mb-4"></div>
                  <p className="text-[15px] font-bold text-[#1A1A1A]">Loading reviews...</p>
                </div>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => {
                  const isFlagged = review.flagged_status != null;
                  return (
                  <div
                    key={review.id}
                    className={`flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-4 py-4 lg:items-center rounded-2xl border transition-all duration-300 relative ${
                      isFlagged
                        ? "bg-[#FFFAFA] border-[#FBD5D5] hover:shadow-[0_4px_20px_rgb(235,87,87,0.08)]"
                        : "bg-white border-[#F0EBE7] lg:border-transparent hover:border-[#F0EBE7] hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                    }`}
                  >
                    {isFlagged && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#EB5757]" />}

                    <div className="lg:col-span-3 flex flex-col justify-center pr-8 lg:pr-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{review.guest_name || "Guest"}</span>
                        {isFlagged ? (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#FDE8E8] text-[#EB5757] flex items-center gap-1">
                            <Flag size={9} className="fill-current" /> Flagged
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#E6F5EF] text-[#2D7D5C]">
                            Unflagged
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] font-medium text-[#9E7B6A]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="lg:col-span-2 flex items-center">
                      <span className="text-[13px] font-semibold text-[#1A1A1A] bg-[#FFF8F0] px-3 py-1 rounded-lg inline-block">
                        {reviewType === "item" ? review.menu_item_name : "Stay Review"}
                      </span>
                    </div>

                    <div className="lg:col-span-2 flex items-center">
                      {renderStars(review.rating)}
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center mt-1 lg:mt-0">
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed line-clamp-3 lg:line-clamp-2 m-0" title={review.comment}>
                        &quot;{review.comment}&quot;
                      </p>
                      {review.flagged_status && (
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            review.flagged_status === 'FLAGGED' ? 'bg-[#FFF8F0] text-[#C05621]' :
                            review.flagged_status === 'APPROVED' ? 'bg-[#E6F5EF] text-[#2D7D5C]' :
                            'bg-[#FDE8E8] text-[#EB5757]'
                          }`}>
                            Admin review: {review.flagged_status}
                          </span>
                          {review.admin_note && (
                            <span className="text-[11px] text-[#9E7B6A] italic ml-1" title={review.admin_note}>
                              <MessageSquare size={10} className="inline mr-1" />
                              <span className="hidden lg:inline">Hover to read note</span>
                              <span className="inline lg:hidden">Admin note attached</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 lg:static lg:col-span-1 flex justify-center">
                      {!review.flagged_status ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenFlagModal(review)}
                          className="text-[#9E7B6A] hover:bg-[#FFF6F6] hover:text-[#EB5757] transition-colors rounded-xl h-8 w-8 lg:h-9 lg:w-9 bg-[#F5F6F8] lg:bg-transparent"
                          title="Flag Review"
                        >
                          <Flag size={14} className="lg:w-4 lg:h-4" />
                        </Button>
                      ) : (
                        <div className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-[#9E7B6A] opacity-50 cursor-not-allowed bg-[#F5F6F8] lg:bg-transparent rounded-xl" title="Already Flagged">
                           <Flag size={14} className="fill-current lg:w-4 lg:h-4" />
                        </div>
                      )}
                    </div>

                  </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[#9E7B6A]">
                  <CheckCircle2 className="h-12 w-12 text-[#2D7D5C] opacity-40 mb-4" />
                  <p className="text-[15px] font-bold text-[#1c1917] m-0">You&apos;re completely caught up!</p>
                  <p className="text-[13px]">You&apos;re all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
        </div>
      </main>

      {/* Flagging Modal */}
      <Dialog open={isFlagModalOpen} onOpenChange={setIsFlagModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl border-0 shadow-2xl p-5">
          <DialogHeader className="mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF6F6] flex items-center justify-center shadow-inner mb-4">
              <ShieldAlert size={20} className="text-[#EB5757]" />
            </div>
            <DialogTitle className="text-[20px] font-extrabold text-[#1A1A1A]">Flag Review</DialogTitle>
            <DialogDescription className="text-[#9E7B6A] font-medium">
              Flag this review to send it to the admin moderation queue (admin.flagged_reviews).
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="bg-[#FAFBFC] p-4 rounded-2xl border border-[#F0EBE7] mb-5">
              <p className="text-[13px] text-[#44403c] italic leading-relaxed m-0">&quot;{selectedReview.comment}&quot;</p>
            </div>
          )}

          <div className="grid gap-5 py-2">
            <div className="flex flex-col gap-2.5">
              <Label className="text-[12px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Flag Reason Type *</Label>
              <Select value={flagType} onValueChange={setFlagType}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-[#F0EBE7] focus:ring-[#C05621]/30">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#F0EBE7] shadow-xl">
                  <SelectItem value="PROFANITY">Inappropriate Language</SelectItem>
                  <SelectItem value="SPAM_SCAM">Spam or Fake</SelectItem>
                  <SelectItem value="POLICY_VIOLATION">Unfair/False Claims</SelectItem>
                  <SelectItem value="HARASSMENT">Harassment/Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <Label className="text-[12px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Additional Details</Label>
              <Textarea 
                placeholder="Briefly explain why this review is being flagged..." 
                className="resize-none h-24 rounded-xl bg-white border-[#F0EBE7] focus-visible:ring-[#C05621]/30"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsFlagModalOpen(false)}
              className="rounded-xl border-[#F0EBE7] text-[#9E7B6A] hover:bg-[#F5F6F8] hover:text-[#1A1A1A] h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFlagSubmit}
              className="rounded-xl bg-[#EB5757] hover:bg-[#D94F4F] text-white shadow-[0_4px_14px_rgb(235,87,87,0.3)] h-11"
            >
              Flag for Moderation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
