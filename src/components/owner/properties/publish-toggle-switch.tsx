"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PublishToggleSwitchProps {
  isActive: boolean;
  onToggle: () => Promise<boolean>;
  disabled?: boolean;
}

export default function PublishToggleSwitch({ isActive, onToggle, disabled }: PublishToggleSwitchProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading || disabled) return;
    setLoading(true);
    await onToggle();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 bg-white border border-[#E8DDD8] rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex-1">
        <p className="text-[14px] font-bold text-[#1A1A1A]">
          {isActive ? "Property is Live" : "Property is Inactive"}
        </p>
        <p className="text-[12px] text-[#9E7B6A] mt-0.5">
          {isActive
            ? "Guests can discover and book this property."
            : "Property is hidden from guests. Toggle to make it live."}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || disabled}
        aria-label={isActive ? "Deactivate property" : "Activate property"}
        className={`relative inline-flex h-7 w-13 w-[52px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#953002] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive ? "bg-[#059669]" : "bg-[#D1D5DB]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
            isActive ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {loading && <Loader2 size={12} className="animate-spin text-[#9CA3AF]" />}
        </span>
      </button>
    </div>
  );
}
