"use client";

import { useEffect, useState } from "react";
import { useOfflineSyncStore } from "@/store/staff/offline-sync.store";
import { BASE_URL } from "@/lib/axios";

/**
 * Path used purely as a backend reachability probe. It is on the API origin,
 * CORS-enabled and needs no auth, so it answers the question that actually
 * matters: "is the BACKEND reachable", not "does the OS think the NIC is up".
 *
 * MUST be kept in sync with NETWORK_PROBE_PATH in next.config.ts, which
 * registers a NetworkOnly service-worker rule for it. Without that rule the
 * service worker's NetworkFirst API cache would happily answer this request
 * from cache while the backend is down, and we would report "Live" over stale
 * data -- the exact failure this hook exists to prevent.
 */
export const NETWORK_PROBE_PATH = "/api/guest/search/filters";
export const NETWORK_PROBE_URL = `${BASE_URL}${NETWORK_PROBE_PATH}`;

/** Poll cadence while things are healthy. */
const POLL_OK_MS = 20_000;
/** Faster cadence while degraded, so recovery is noticed quickly. */
const POLL_DEGRADED_MS = 5_000;
const PROBE_TIMEOUT_MS = 6_000;

export type NetworkStatus =
  /** Not probed yet (first render / SSR). */
  | "unknown"
  /** Device online and backend answering. */
  | "online"
  /** Device has a connection, but the backend does not answer. */
  | "backend-unreachable"
  /** The device itself reports no connection. */
  | "device-offline";

export interface NetworkState {
  status: NetworkStatus;
  /** True only when the backend is actually reachable. */
  isOnline: boolean;
  /** What `navigator.onLine` reports. */
  isDeviceOnline: boolean;
}

/**
 * Probes the backend once.
 *
 * A gateway status (502/503/504) means the edge answered but the application
 * behind it is down, so that counts as unreachable. Any other HTTP status --
 * including 4xx -- proves the backend responded, so it counts as reachable.
 */
async function probeBackend(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${NETWORK_PROBE_URL}?_probe=${Date.now()}`, {
      method: "GET",
      // Bypass the HTTP cache. (The service worker is handled by the
      // NetworkOnly rule declared in next.config.ts.)
      cache: "no-store",
      // Unauthenticated: keeps this a simple CORS request with no preflight and
      // no dependency on a valid session.
      credentials: "omit",
      signal: controller.signal,
    });
    return ![502, 503, 504].includes(res.status);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reports whether the backend is reachable, distinguishing "device offline"
 * from "device online but backend unreachable", and keeps the offline-sync
 * store in step with that.
 *
 * Previously this only mirrored `navigator.onLine` and never contacted the
 * server at all, so a live NIC with a dead backend still read as "Online" and
 * the state never refreshed.
 */
export function useNetworkStatus(): NetworkState {
  const [status, setStatus] = useState<NetworkStatus>("unknown");
  const [isDeviceOnline, setIsDeviceOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    // Tracks the previous *backend* reachability so we only flush the queue on a
    // genuine offline -> online edge, not on every successful poll.
    let wasReachable: boolean | null = null;

    const apply = (next: NetworkStatus) => {
      if (cancelled) return;
      const reachable = next === "online";
      setStatus(next);
      setIsDeviceOnline(next !== "device-offline");

      const store = useOfflineSyncStore.getState();
      store.setBackendOnline(reachable);

      // Drain queued writes when connectivity is regained, and also on the very
      // first successful probe of a session (a queue can survive a page reload).
      if (reachable && wasReachable !== true) {
        if (store.queue.length > 0) void store.syncAll();
      }
      wasReachable = reachable;
    };

    const schedule = (delay: number) => {
      if (cancelled) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(run, delay);
    };

    const run = async () => {
      if (cancelled || inFlight) return;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        apply("device-offline");
        schedule(POLL_DEGRADED_MS);
        return;
      }

      inFlight = true;
      let reachable = false;
      try {
        reachable = await probeBackend();
      } finally {
        inFlight = false;
      }
      if (cancelled) return;

      // Re-check the device flag: it may have dropped during the probe.
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        apply("device-offline");
        schedule(POLL_DEGRADED_MS);
        return;
      }

      apply(reachable ? "online" : "backend-unreachable");
      schedule(reachable ? POLL_OK_MS : POLL_DEGRADED_MS);
    };

    const handleBrowserOnline = () => {
      setIsDeviceOnline(true);
      void run();
    };
    const handleBrowserOffline = () => {
      clearTimeout(timeoutId);
      apply("device-offline");
      schedule(POLL_DEGRADED_MS);
    };
    const handleVisibility = () => {
      // Re-probe as soon as the tab is looked at again, rather than showing a
      // status that may be a whole poll interval stale.
      if (document.visibilityState === "visible") void run();
    };

    window.addEventListener("online", handleBrowserOnline);
    window.addEventListener("offline", handleBrowserOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    setIsDeviceOnline(navigator.onLine !== false);
    void run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("online", handleBrowserOnline);
      window.removeEventListener("offline", handleBrowserOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return {
    status,
    isOnline: status === "online",
    isDeviceOnline,
  };
}
