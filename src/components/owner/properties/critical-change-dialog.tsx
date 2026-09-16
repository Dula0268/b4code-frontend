"use client";
import { AlertTriangle } from "lucide-react";

interface CriticalChangeDialogProps {
  isOpen: boolean;
  changedFields: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CriticalChangeDialog({
  isOpen, changedFields, onConfirm, onCancel, isSubmitting
}: CriticalChangeDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} className="text-[#D97706]" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1A1A1A]">Re-review Required</h3>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Changing these fields will send this property back for admin re-review. It will be temporarily
              unlisted until approved again.
            </p>
          </div>
        </div>
        {changedFields.length > 0 && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3 mb-5">
            <p className="text-[12px] font-semibold text-[#D97706] uppercase tracking-wide mb-1.5">Changed Fields</p>
            <ul className="space-y-1">
              {changedFields.map((f) => (
                <li key={f} className="text-[13px] text-[#92400E] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E8DDD8] text-[14px] font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-[#D97706] text-white text-[14px] font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save & Resubmit"}
          </button>
        </div>
      </div>
    </div>
  );
}
