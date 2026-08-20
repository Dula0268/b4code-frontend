"use client";

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useTranslations } from "next-intl";

export default function NetworkIndicator() {
  const t = useTranslations('StaffDashboard');
  const isOnline = useNetworkStatus();

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-300 bg-[rgba(130,130,130,0.1)] border-[rgba(130,130,130,0.2)] text-[var(--gray-3)]">
        <Loader2 size={12} className="animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-300 ${
        isOnline
          ? "bg-[rgba(39,174,96,0.1)] border-[rgba(39,174,96,0.2)] text-[var(--state-success)]"
          : "bg-[rgba(235,87,87,0.1)] border-[rgba(235,87,87,0.2)] text-[var(--state-error)]"
      }`}
    >
      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
      <span>{isOnline ? t('online') : t('offline')}</span>
    </div>
  );
}
