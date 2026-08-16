"use client";

import React, { useState, useEffect } from "react";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
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

export default function ReviewManagementPage() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId || 1;

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
      const res = await api.get(`/staff/reviews?propertyId=${propertyId}`);
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
  }, [propertyId]);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = r.guest_name?.toLowerCase().includes(search.toLowerCase()) || 
      r.menu_item_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "flagged") {
      return matchesSearch && r.flagged_status != null;
    }
    return matchesSearch;
  });

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
      await api.post(`/staff/reviews/${selectedReview.id}/flag`, {
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

  return (
    <StaffPageLayout>
      <StaffHeader 
        title="Review Management" 
        subtitle="Monitor and moderate guest reviews" 
        searchPlaceholder="Search reviews..."
        onSearch={(query) => setSearch(query)}
      />
      
      <main className="mt-[64px] flex-1 p-8 text-[#9E7B6A] h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        
        {/* Top Controls Box */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8F0] flex items-center justify-center shadow-inner">
                <Star size={20} className="text-[#C05621]" />
              </div>
              <div>
                <h2 className="text-[18px] font-extrabold text-[#1A1A1A] m-0">Guest Item Reviews</h2>
                <p className="text-[13px] font-semibold text-[#9E7B6A] opacity-80 m-0">Flag inappropriate content for admin moderation</p>
              </div>
            </div>

            <div className="h-10 border-l border-[#F0EBE7]"></div>

            <div className="flex items-center bg-[#F5F6F8] rounded-xl p-1 shadow-inner border border-[#E8E8E8]">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === "all" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#9E7B6A] hover:text-[#1A1A1A]"}`}
              >
                All Reviews
              </button>
              <button 
                onClick={() => setActiveTab("flagged")}
                className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === "flagged" ? "bg-white text-[#EB5757] shadow-sm" : "text-[#9E7B6A] hover:text-[#EB5757]"}`}
              >
                <ShieldAlert size={14} />
                Flagged
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table Container (Scrollable) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 min-h-0 flex flex-col overflow-hidden">
          
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F0EBE7] flex-shrink-0">
            <div className="col-span-3 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Guest & Date</div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Item</div>
            <div className="col-span-2 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Rating</div>
            <div className="col-span-4 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Comment</div>
            <div className="col-span-1 text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase text-center">Action</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#9E7B6A]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C05621] mb-4"></div>
                  <p className="text-[15px] font-bold text-[#1A1A1A]">Loading reviews...</p>
                </div>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div key={review.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-white rounded-2xl border border-transparent hover:border-[#F0EBE7] hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300">
                    
                    <div className="col-span-3 flex flex-col justify-center">
                      <span className="text-[14px] font-bold text-[#1A1A1A]">{review.guest_name || "Guest"}</span>
                      <span className="text-[12px] font-medium text-[#9E7B6A]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span className="text-[13px] font-semibold text-[#1A1A1A] bg-[#FFF8F0] px-3 py-1 rounded-lg">
                        {review.menu_item_name}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center">
                      {renderStars(review.rating)}
                    </div>

                    <div className="col-span-4 flex flex-col justify-center">
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed line-clamp-2 m-0" title={review.comment}>
                        &quot;{review.comment}&quot;
                      </p>
                      {review.flagged_status && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            review.flagged_status === 'FLAGGED' ? 'bg-[#FFF8F0] text-[#C05621]' :
                            review.flagged_status === 'APPROVED' ? 'bg-[#E6F5EF] text-[#2D7D5C]' :
                            'bg-[#FDE8E8] text-[#EB5757]'
                          }`}>
                            Admin Status: {review.flagged_status}
                          </span>
                          {review.admin_note && (
                            <span className="text-[11px] text-[#9E7B6A] italic ml-1" title={review.admin_note}>
                              <MessageSquare size={10} className="inline mr-1" />
                              Hover to read note
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 flex justify-center">
                      {!review.flagged_status ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenFlagModal(review)}
                          className="text-[#9E7B6A] hover:bg-[#FFF6F6] hover:text-[#EB5757] transition-colors rounded-xl h-9 w-9"
                          title="Flag Review"
                        >
                          <Flag size={16} />
                        </Button>
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center text-[#9E7B6A] opacity-50 cursor-not-allowed" title="Already Flagged">
                           <Flag size={16} className="fill-current" />
                        </div>
                      )}
                    </div>

                  </div>
                ))
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
      </main>

      {/* Flagging Modal */}
      <Dialog open={isFlagModalOpen} onOpenChange={setIsFlagModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl border-0 shadow-2xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6F6] flex items-center justify-center shadow-inner mb-4">
              <ShieldAlert size={24} className="text-[#EB5757]" />
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
    </StaffPageLayout>
  );
}
