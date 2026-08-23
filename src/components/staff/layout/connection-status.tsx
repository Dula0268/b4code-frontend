"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CloudOff, Loader2, RefreshCw, ServerCrash, Wifi } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineSyncStore } from "@/store/staff/offline-sync.store";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "ok" | "warn" | "error";

const TONE_PILL: Record<Tone, string> = {
  neutral: "bg-[rgba(130,130,130,0.1)] border-[rgba(130,130,130,0.2)] text-[var(--gray-3)]",
  ok: "bg-[rgba(39,174,96,0.1)] border-[rgba(39,174,96,0.2)] text-[var(--state-success)]",
  warn: "bg-[rgba(226,185,59,0.12)] border-[rgba(226,185,59,0.28)] text-[#8a6d12]",
  error: "bg-[rgba(235,87,87,0.1)] border-[rgba(235,87,87,0.2)] text-[var(--state-error)]",
};

const TONE_BANNER: Record<Tone, string> = {
  neutral: "bg-white border-[#E8EAED] text-[var(--gray-3)]",
  ok: "bg-white border-[rgba(39,174,96,0.3)] text-[var(--state-success)]",
  warn: "bg-[#FFFBEF] border-[rgba(226,185,59,0.45)] text-[#8a6d12]",
  error: "bg-[#FFF5F5] border-[rgba(235,87,87,0.4)] text-[var(--state-error)]",
};

interface Presentation {
  tone: Tone;
  icon: React.ReactNode;
  /** Short text for the header pill. */
  label: string;
  /** Full sentence about data freshness, for the banner and the pill tooltip. */
  detail: string;
  /** True while everything is current: the banner stays hidden. */
  healthy: boolean;
  /** Show a manual "retry sync" affordance. */
  canRetry: boolean;
}

/**
 * Single source of truth for what staff are told about their data.
 *
 * Deliberately answers two separate questions at once, because either alone is
 * misleading: (1) can we reach the backend, and (2) is what you are looking at
 * current, or cached, or waiting to be saved.
 */
function useConnectionPresentation(): Presentation | null {
  const t = useTranslations("StaffDashboard.connection");
  const format = useFormatter();
  const { status } = useNetworkStatus();

  const queue = useOfflineSyncStore((s) => s.queue);
  const failed = useOfflineSyncStore((s) => s.failed);
  const isSyncing = useOfflineSyncStore((s) => s.isSyncing);
  const lastOnlineAt = useOfflineSyncStore((s) => s.lastOnlineAt);
  const lastSyncError = useOfflineSyncStore((s) => s.lastSyncError);

  // Persisted values only exist after rehydration, so rendering them during the
  // server pass / first paint would produce a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const pending = queue.length;
  const stamp = (ms: number) =>
    format.dateTime(new Date(ms), {
      dateStyle: Date.now() - ms > 12 * 60 * 60 * 1000 ? "medium" : undefined,
      timeStyle: "short",
    });

  const cachedFrom = lastOnlineAt ? t("cachedFrom", { time: stamp(lastOnlineAt) }) : t("noCachedData");

  if (status === "unknown") {
    return {
      tone: "neutral",
      icon: <Loader2 size={12} className="animate-spin" />,
      label: t("connecting"),
      detail: t("connectingDetail"),
      healthy: false,
      canRetry: false,
    };
  }

  if (failed.length > 0 || lastSyncError) {
    return {
      tone: "error",
      icon: <AlertTriangle size={12} />,
      label: t("syncFailed"),
      detail:
        failed.length > 0
          ? t("syncFailedDetail", { count: failed.length })
          : t("syncStalledDetail", { count: pending }),
      healthy: false,
      canRetry: true,
    };
  }

  if (isSyncing) {
    return {
      tone: "warn",
      icon: <Loader2 size={12} className="animate-spin" />,
      label: t("syncing", { count: pending }),
      detail: t("syncingDetail", { count: pending }),
      healthy: false,
      canRetry: false,
    };
  }

  if (status !== "online") {
    const deviceOffline = status === "device-offline";
    return {
      tone: "error",
      icon: deviceOffline ? <CloudOff size={12} /> : <ServerCrash size={12} />,
      label: deviceOffline ? t("deviceOffline") : t("backendUnreachable"),
      detail:
        pending > 0
          ? `${cachedFrom} ${t("pendingSuffix", { count: pending })}`
          : cachedFrom,
      healthy: false,
      canRetry: false,
    };
  }

  if (pending > 0) {
    return {
      tone: "warn",
      icon: <RefreshCw size={12} />,
      label: t("pending", { count: pending }),
      detail: t("pendingDetail", { count: pending }),
      healthy: false,
      canRetry: true,
    };
  }

  return {
    tone: "ok",
    icon: <Wifi size={12} />,
    label: t("live"),
    detail: lastOnlineAt ? t("liveDetail", { time: stamp(lastOnlineAt) }) : t("live"),
    healthy: true,
    canRetry: false,
  };
}

/** Compact pill for the staff header. */
export function ConnectionStatusBadge({ className }: { className?: string }) {
  const p = useConnectionPresentation();

  if (!p) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold",
          TONE_PILL.neutral,
          className
        )}
      >
        <Loader2 size={12} className="animate-spin" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      title={p.detail}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-300",
        TONE_PILL[p.tone],
        className
      )}
    >
      {p.icon}
      <span>{p.label}</span>
    </div>
  );
}

/**
 * Persistent banner mounted once by the staff shell.
 *
 * The header pill is hidden below the `sm` breakpoint, and staff on phones are
 * exactly the people most likely to be offline, so anything other than a
 * healthy state also surfaces here where it cannot be missed.
 */
export default function ConnectionStatusBanner() {
  const t = useTranslations("StaffDashboard.connection");
  const p = useConnectionPresentation();
  const syncAll = useOfflineSyncStore((s) => s.syncAll);
  const retryFailed = useOfflineSyncStore((s) => s.retryFailed);
  const hasFailed = useOfflineSyncStore((s) => s.failed.length > 0);

  if (!p || p.healthy) return null;

  const onRetry = () => {
    if (hasFailed) retryFailed();
    void syncAll();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[276px] lg:translate-x-0 z-50",
        "flex items-center gap-3 max-w-[calc(100vw-2rem)] px-4 py-2.5 rounded-2xl border shadow-lg",
        TONE_BANNER[p.tone]
      )}
    >
      <span className="shrink-0">{p.icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-bold leading-4">{p.label}</span>
        <span className="text-[11px] leading-4 opacity-80 truncate">{p.detail}</span>
      </div>
      {p.canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-[11px] font-bold underline underline-offset-2 hover:opacity-70"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
