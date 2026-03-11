"use client";

import { useState } from "react";
import { Save, CheckCircle2, X } from "lucide-react";

// ─── Success Toast ────────────────────────────────────────────────────────────
function SuccessToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed top-6 right-6 z-999 flex items-center gap-2.5 bg-white rounded-xl px-4.5 py-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e8f5e9] animate-[slideIn_0.25s_ease]">
      <CheckCircle2 size={18} color="#27ae60" />
      <span className="text-sm font-semibold text-[#1d1d1d]">
        Payment model saved successfully!
      </span>
      <button
        onClick={onClose}
        className="bg-transparent border-none cursor-pointer text-[#888] ml-1 flex"
      >
        <X size={15} />
      </button>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

// ─── Payment Model Component ─────────────────────────────────────────────────
export default function PaymentModel() {
  const [selected, setSelected] = useState<"direct" | "platform">("platform");
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <>
      {showToast && <SuccessToast onClose={() => setShowToast(false)} />}

      <div className="mt-8">
        <h3 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1">
          Payment Model
        </h3>
        <p className="text-[13px] text-[#9E7B6A] m-0 mb-5">
          Configure how funds are collected and disbursed.
        </p>

        <div className="flex flex-col gap-3">
          {/* Direct Settlement */}
          <div
            onClick={() => setSelected("direct")}
            className={`p-5 rounded-xl border-[1.5px] cursor-pointer transition-colors ${
              selected === "direct"
                ? "border-[#C05621] bg-[#FFF8F5]"
                : "border-[#E8DDD8] bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selected === "direct"
                    ? "border-[#C05621]"
                    : "border-[#D1D5DB]"
                }`}
              >
                {selected === "direct" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C05621]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-[14px] text-[#1A1A1A]">
                    Direct Settlement
                  </span>
                  <span className="text-[10px] font-bold text-[#9E7B6A] bg-[#F0EBE7] px-2 py-0.5 rounded-full">
                    LEGACY
                  </span>
                </div>
                <p className="m-0 text-[13px] text-[#6B7280] leading-relaxed">
                  The property collects payments directly from the guest upon
                  arrival or via their own payment gateway. PRIME STAY invoices
                  the owner for commission monthly.
                </p>
              </div>
            </div>
          </div>

          {/* Platform-Mediated Payout */}
          <div
            onClick={() => setSelected("platform")}
            className={`p-5 rounded-xl border-[1.5px] cursor-pointer transition-colors ${
              selected === "platform"
                ? "border-[#C05621] bg-[#FFF8F5]"
                : "border-[#E8DDD8] bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selected === "platform"
                    ? "border-[#C05621]"
                    : "border-[#D1D5DB]"
                }`}
              >
                {selected === "platform" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C05621]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-[14px] text-[#C05621]">
                    Platform-Mediated Payout
                  </span>
                  <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <p className="m-0 text-[13px] text-[#6B7280] leading-relaxed">
                  PRIME STAY collects the full payment from the guest securely.
                  We deduct our commission and payout the net balance to the
                  owner 24 hours after check-in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7C2D12] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#6C2710] transition-colors shadow-[0_2px_8px_rgba(124,45,18,0.25)]"
          >
            <Save size={16} />
            Save & Lock Payment Model
          </button>
        </div>
      </div>
    </>
  );
}
