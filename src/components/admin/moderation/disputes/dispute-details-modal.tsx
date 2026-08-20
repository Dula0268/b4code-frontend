"use client";

import { useState, useEffect } from "react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";
import type { Dispute } from "@/api/admin/moderation.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function DisputeDetailsModal({ 
  dispute, 
  isComplaint, 
  onClose 
}: { 
  dispute: Dispute | null; 
  isComplaint: boolean; 
  onClose: () => void;
}) {
  const { resolveDispute, actionLoading, setDisputeResolved } = useAdminModerationStore();
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

  useEffect(() => {
    setViewingImageIndex(null);
  }, [dispute]);

  if (!dispute) return null;

  const handleResolve = async (approved: boolean) => {
    await resolveDispute(dispute.id, approved ? "Resolved in Guest Favor" : "Resolved in Host Favor", approved);
    setDisputeResolved({
      amount: approved ? dispute.amount : "LKR 0.00",
      bookingId: dispute.bookingId || "#BK-UNKNOWN",
      caseId: dispute.disputeId,
      time: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  const hasPhotos = dispute.photoUrls && dispute.photoUrls.trim().length > 0;
  const photoArray = hasPhotos ? dispute.photoUrls!.split(",").map(u => u.trim()) : [];

  return (
    <Dialog open={!!dispute} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[700px] p-0 overflow-hidden bg-[#fafafa]"
        onInteractOutside={(e) => {
          if (viewingImageIndex !== null) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className="bg-[#953002] text-white py-6 px-6">
          <div className="flex items-center gap-2 text-white/90 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#953002] bg-white px-2 py-1 rounded shadow-sm">CASE #{dispute.disputeId.replace('DSP-', '').split('-')[0]}</span>
            {isComplaint && dispute.category && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase">{dispute.category}</span>
            )}
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-2">
            {isComplaint ? "Guest Complaint" : "Refund Request"}
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          
          {/* Booking Context */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e8ddcf] overflow-hidden">
            <div className="bg-[#fdfaf6] px-5 py-3 border-b border-[#e8ddcf] flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="text-[#9a3300] w-4 h-4" /> Context
              </h3>
              {!isComplaint && (
                <span className="font-bold text-[#1A1A1A] text-lg">{dispute.amount}</span>
              )}
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#e8ddcf] p-4 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Property</span>
                <span className="text-[13px] font-semibold text-slate-900">{dispute.propertyName}</span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Guest</span>
                <span className="text-[13px] font-semibold text-slate-900">{dispute.guestName}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e8ddcf] p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Description</span>
            <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {dispute.reason || dispute.internalNote || "No detailed description provided by the guest."}
            </p>
          </div>

          {/* Evidence Gallery */}
          {(hasPhotos || dispute.status === "Evidence Uploaded") && (
            <div className="bg-white rounded-xl shadow-sm border border-[#e8ddcf] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={16} className="text-blue-500"/>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Evidence Provided</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {hasPhotos ? (
                  photoArray.map((url, i) => (
                    <div 
                      key={i} 
                      className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer border border-[#E8DDD8] hover:opacity-80 transition shadow-sm"
                      onClick={() => setViewingImageIndex(i)}
                    >
                      <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#E8DDD8] bg-slate-50 flex items-center justify-center">
                    <span className="text-xs text-slate-400">No photos</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {dispute.status !== "Resolved" && (
            <div className="flex gap-3 pt-4 border-t border-[#E8DDD8]">
              <Button 
                onClick={() => handleResolve(true)} 
                disabled={actionLoading}
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white h-11 cursor-pointer"
              >
                {isComplaint ? "Resolve Complaint (Guest Wins)" : "Approve Refund"}
              </Button>
              <Button 
                onClick={() => handleResolve(false)} 
                disabled={actionLoading}
                variant="outline"
                className="flex-1 h-11 cursor-pointer"
              >
                {isComplaint ? "Dismiss Complaint" : "Deny Refund (Host Wins)"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Image Fullscreen Carousel using nested Dialog */}
      <Dialog open={viewingImageIndex !== null} onOpenChange={(open) => !open && setViewingImageIndex(null)}>
        <DialogContent className="max-w-[100vw] w-screen h-screen bg-transparent border-none shadow-none flex items-center justify-center p-0 [&>button:first-child]:hidden">
          <DialogTitle className="sr-only">Evidence Fullscreen Viewer</DialogTitle>
          <button 
            type="button"
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white p-3 hover:bg-white/20 rounded-full transition z-[110] cursor-pointer" 
            onClick={() => setViewingImageIndex(null)}
          >
            <X size={32} />
          </button>
          
          {photoArray.length > 1 && (
            <button 
              type="button"
              className="absolute left-4 md:left-10 text-white p-4 hover:bg-white/20 rounded-full transition z-[110] cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingImageIndex((viewingImageIndex! - 1 + photoArray.length) % photoArray.length); }}
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {viewingImageIndex !== null && (
            <img 
              src={photoArray[viewingImageIndex]} 
              className="max-w-[95vw] max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] object-contain rounded-xl shadow-2xl" 
              alt={`Evidence ${viewingImageIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {photoArray.length > 1 && (
            <button 
              type="button"
              className="absolute right-4 md:right-10 text-white p-4 hover:bg-white/20 rounded-full transition z-[110] cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setViewingImageIndex((viewingImageIndex! + 1) % photoArray.length); }}
            >
              <ChevronRight size={48} />
            </button>
          )}

          {viewingImageIndex !== null && photoArray.length > 1 && (
            <div className="absolute bottom-6 text-white/90 text-sm font-semibold bg-black/60 px-5 py-2 rounded-full z-[110]">
              {viewingImageIndex + 1} / {photoArray.length}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
