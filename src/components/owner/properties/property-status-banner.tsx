"use client";
import { BackendPropertyStatus } from "@/models/owner";
import { AlertCircle, Clock, CheckCircle2, XCircle, EyeOff, Wrench } from "lucide-react";

interface PropertyStatusBannerProps {
  status: BackendPropertyStatus;
  rejectionReason?: string;
  onResubmit?: () => void;
  isSubmitting?: boolean;
}

const bannerConfig: Record<string, { bg: string; border: string; icon: React.ElementType; title: string; message: string; iconColor: string }> = {
  PENDING:      { bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", icon: Clock,         iconColor: "text-[#D97706]", title: "Pending Admin Review",    message: "Your property has been submitted and is waiting for our team to begin the review process. This usually takes 1–2 business days." },
  UNDER_REVIEW: { bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]", icon: AlertCircle,   iconColor: "text-[#2563EB]", title: "Currently Under Review",   message: "Our admin team is actively reviewing your property. You will be notified once the review is complete. Editing is locked during this time." },
  APPROVED:     { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", icon: CheckCircle2,  iconColor: "text-[#059669]", title: "Property Approved!",        message: "Your property has been approved and is now active on the platform. Guests can discover and book it." },
  INACTIVE:     { bg: "bg-[#F9FAFB]", border: "border-[#E5E7EB]", icon: EyeOff,        iconColor: "text-[#6B7280]", title: "Property is Inactive",      message: "Your property is currently hidden from guests. Toggle it active when you are ready to accept bookings." },
  MAINTENANCE:  { bg: "bg-[#FFFBEB]", border: "border-[#FDE68A]", icon: Wrench,        iconColor: "text-[#D97706]", title: "Under Maintenance",         message: "Your property is in maintenance mode and is not visible to guests." },
  REJECTED:     { bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", icon: XCircle,       iconColor: "text-[#DC2626]", title: "Property Rejected",         message: "Your property did not pass our content review. Please address the feedback below and resubmit." },
};

export default function PropertyStatusBanner({ status, rejectionReason, onResubmit, isSubmitting }: PropertyStatusBannerProps) {
  const config = bannerConfig[status];
  if (!config || status === "ACTIVE") return null;
  const Icon = config.icon;
  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}><Icon size={22} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1A1A1A] text-[15px]">{config.title}</p>
          <p className="text-[13px] text-[#4B5563] mt-1 leading-relaxed">{config.message}</p>
          {status === "REJECTED" && rejectionReason && (
            <div className="mt-3 bg-white/70 border border-[#FECACA] rounded-xl p-3">
              <p className="text-[12px] font-semibold text-[#DC2626] uppercase tracking-wide mb-1">Admin Feedback</p>
              <p className="text-[13px] text-[#1A1A1A]">{rejectionReason}</p>
            </div>
          )}
          {status === "REJECTED" && onResubmit && (
            <button
              onClick={onResubmit}
              disabled={isSubmitting}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#953002] text-white text-[13px] font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? "Resubmitting…" : "Fix & Resubmit for Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
